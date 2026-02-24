"""
BillSentry Health - Benchmark Engine
Compares parsed line items against government rate databases (CGHS, PMJAY, NPPA).

Variance Logic:
  - OK: within 20% of benchmark max
  - SUSPICIOUS: 20-40% above benchmark
  - OVERCHARGED: >40% above benchmark
"""

import logging
from typing import Optional
from dataclasses import dataclass

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


@dataclass
class BenchmarkMatch:
    """Result of comparing a line item against benchmark rates."""
    matched: bool = False
    benchmark_min: float = 0.0
    benchmark_max: float = 0.0
    benchmark_source: Optional[str] = None
    benchmark_name: Optional[str] = None
    variance_pct: float = 0.0
    flag: str = "OK"
    flag_reason: str = ""


def compare_line_item(
    description: str,
    category: str,
    total_price: float,
    city: Optional[str],
    db: Session,
) -> BenchmarkMatch:
    """
    Compare a single line item against the PriceRule database.
    Uses fuzzy matching to find the closest benchmark entry.
    """
    from app.models.models import PriceRule

    result = BenchmarkMatch()

    if total_price <= 0:
        return result

    # Step 1: Try exact category + fuzzy name match
    candidates = _find_benchmark_candidates(description, category, city, db)

    if not candidates:
        # No benchmark found — can't flag
        result.flag = "OK"
        result.flag_reason = "No benchmark data available"
        return result

    # Step 2: Pick the best match
    best = candidates[0]
    result.matched = True
    result.benchmark_min = best.benchmark_min
    result.benchmark_max = best.benchmark_max
    result.benchmark_source = best.source.value if best.source else "UNKNOWN"
    result.benchmark_name = best.name

    # Step 3: Calculate variance
    if best.benchmark_max > 0:
        result.variance_pct = round(
            ((total_price - best.benchmark_max) / best.benchmark_max) * 100, 2
        )
    else:
        result.variance_pct = 0.0

    # Step 4: Flag based on variance
    if result.variance_pct <= 20:
        result.flag = "OK"
        result.flag_reason = f"Within acceptable range ({result.variance_pct}% variance)"
    elif result.variance_pct <= 40:
        result.flag = "SUSPICIOUS"
        result.flag_reason = (
            f"Elevated variance: {result.variance_pct}% above {result.benchmark_source} "
            f"benchmark (₹{best.benchmark_max:,.0f})"
        )
    else:
        result.flag = "OVERCHARGED"
        result.flag_reason = (
            f"High variance: {result.variance_pct}% above {result.benchmark_source} "
            f"benchmark (₹{best.benchmark_max:,.0f}). Billed ₹{total_price:,.0f} vs "
            f"max ₹{best.benchmark_max:,.0f}"
        )

    return result


def _find_benchmark_candidates(
    description: str, category: str, city: Optional[str], db: Session
) -> list:
    """
    Find matching benchmark rules for a given item.
    Tries: exact category match → fuzzy name search → any category.
    """
    from app.models.models import PriceRule, LineItemCategory

    description_lower = description.lower()

    # Query by category first
    try:
        cat_enum = LineItemCategory(category)
        query = db.query(PriceRule).filter(PriceRule.category == cat_enum)
        if city:
            query = query.filter(
                (PriceRule.city == city) | (PriceRule.city.is_(None))
            )
        candidates = query.all()
    except (ValueError, KeyError):
        candidates = db.query(PriceRule).all()

    if not candidates:
        # Try without category filter
        candidates = db.query(PriceRule).all()

    if not candidates:
        return []

    # Fuzzy match against candidate names
    try:
        from rapidfuzz import fuzz

        scored = []
        for rule in candidates:
            score = fuzz.partial_ratio(description_lower, rule.name.lower())
            if score > 55:  # Minimum threshold
                scored.append((score, rule))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [rule for _, rule in scored[:5]]
    except ImportError:
        # Fallback: simple substring match
        matched = [
            r for r in candidates
            if any(
                word in r.name.lower()
                for word in description_lower.split()
                if len(word) > 3
            )
        ]
        return matched[:5]


def detect_duplicates(
    line_items: list[dict],
) -> list[tuple[int, int, float]]:
    """
    Detect potential duplicate charges in line items.
    Returns pairs of (index1, index2, similarity_score).
    """
    duplicates = []

    try:
        from rapidfuzz import fuzz

        for i in range(len(line_items)):
            for j in range(i + 1, len(line_items)):
                desc_i = line_items[i].get("description", "")
                desc_j = line_items[j].get("description", "")
                price_i = line_items[i].get("total_price", 0)
                price_j = line_items[j].get("total_price", 0)

                # Similar description
                text_sim = fuzz.ratio(desc_i.lower(), desc_j.lower())

                # Similar price (within 10%)
                if price_i > 0 and price_j > 0:
                    price_diff = abs(price_i - price_j) / max(price_i, price_j)
                    price_sim = (1 - price_diff) * 100
                else:
                    price_sim = 0

                # Combined score
                combined = text_sim * 0.7 + price_sim * 0.3
                if combined > 80:
                    duplicates.append((i, j, round(combined, 2)))

    except ImportError:
        logger.warning("rapidfuzz not installed — skipping duplicate detection")

    return duplicates


def calculate_risk_level(
    total_flagged: float, total_billed: float, num_overcharged: int
) -> str:
    """Determine overall risk level for the audit report."""
    if total_billed <= 0:
        return "LOW"

    flagged_pct = (total_flagged / total_billed) * 100

    if flagged_pct > 30 or num_overcharged > 5:
        return "HIGH"
    elif flagged_pct > 15 or num_overcharged > 2:
        return "MEDIUM"
    else:
        return "LOW"
