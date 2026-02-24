"""
BillSentry Health - NLP Parsing Engine
Converts raw OCR text into structured line items (description, qty, price, total).

Strategy:
  1. Detect table-like rows using regex (number patterns, currency symbols)
  2. Extract hospital metadata (name, dates, patient info)
  3. Classify each line item into a medical category via fuzzy matching
"""

import re
import logging
from typing import Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# ── Category keywords for classification ──────────────────────────

CATEGORY_KEYWORDS = {
    "ROOM": ["room", "ward", "bed", "accommodation", "general ward", "semi private", "private room", "deluxe"],
    "ICU": ["icu", "intensive care", "critical care", "nicu", "picu", "ccn", "hdu"],
    "SURGERY_FEE": ["surgery", "operation", "ot charge", "theatre", "surgeon", "anaesthe", "anesthes"],
    "LAB_TEST": ["blood test", "cbc", "culture", "pathology", "lab", "test", "panel", "hba1c", "lipid",
                 "urine", "serum", "biopsy", "histopath"],
    "MEDICINE": ["medicine", "drug", "tablet", "injection", "capsule", "syrup", "iv fluid", "saline",
                 "antibiotic", "paracetamol", "amoxicillin", "insulin"],
    "CONSUMABLE": ["consumable", "syringe", "gloves", "bandage", "dressing", "catheter", "tubing",
                   "ppe", "drape", "gauze", "cotton", "mask", "kit"],
    "DIAGNOSTICS": ["x-ray", "xray", "ct scan", "mri", "ultrasound", "usg", "ecg", "echo",
                    "pet scan", "mammography", "endoscopy", "colonoscopy"],
    "PROFESSIONAL_FEE": ["doctor", "consultant", "specialist", "visiting", "professional fee",
                         "consultation", "physician", "nursing"],
    "MISCELLANEOUS": ["miscellaneous", "misc", "sundry", "other", "service charge", "admin"],
}


@dataclass
class HospitalMetadata:
    """Extracted hospital/bill metadata."""
    hospital_name: Optional[str] = None
    patient_name: Optional[str] = None
    admission_date: Optional[str] = None
    discharge_date: Optional[str] = None
    bill_number: Optional[str] = None
    total_amount: Optional[float] = None


@dataclass
class ParsedLineItem:
    """A single structured line item from a hospital bill."""
    raw_description: str
    normalized_description: str = ""
    category: str = "OTHER"
    quantity: float = 1.0
    unit_price: float = 0.0
    total_price: float = 0.0
    confidence: float = 0.0


@dataclass
class ParseResult:
    """Complete parse result from a hospital bill."""
    metadata: HospitalMetadata = field(default_factory=HospitalMetadata)
    line_items: list[ParsedLineItem] = field(default_factory=list)
    raw_text: str = ""
    error: Optional[str] = None


def parse_bill_text(raw_text: str) -> ParseResult:
    """
    Main entry: parse raw OCR text into structured line items.
    """
    if not raw_text or len(raw_text.strip()) < 20:
        return ParseResult(error="Insufficient text to parse")

    result = ParseResult(raw_text=raw_text)

    # Step 1: Extract metadata
    result.metadata = _extract_metadata(raw_text)

    # Step 2: Extract line items
    result.line_items = _extract_line_items(raw_text)

    # Step 3: Classify each item
    for item in result.line_items:
        item.category = _classify_item(item.raw_description)
        item.normalized_description = _normalize_description(item.raw_description)

    logger.info(f"Parsed {len(result.line_items)} line items from bill")
    return result


# ── Metadata Extraction ───────────────────────────────────────────

def _extract_metadata(text: str) -> HospitalMetadata:
    """Extract hospital name, dates, bill number from the text."""
    meta = HospitalMetadata()

    # Hospital name — usually in the first few lines, often in caps or large text
    lines = text.strip().split("\n")
    for line in lines[:10]:
        clean = line.strip()
        if len(clean) > 10 and (
            "hospital" in clean.lower()
            or "clinic" in clean.lower()
            or "medical" in clean.lower()
            or "healthcare" in clean.lower()
        ):
            meta.hospital_name = clean
            break

    # Bill / Invoice number
    bill_match = re.search(
        r"(?:bill|invoice|receipt)\s*(?:no|number|#|:)?\s*[:\-]?\s*([A-Z0-9\-/]+)",
        text, re.IGNORECASE
    )
    if bill_match:
        meta.bill_number = bill_match.group(1).strip()

    # Dates (DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD)
    date_pattern = r"\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}"
    dates = re.findall(date_pattern, text)
    if len(dates) >= 2:
        meta.admission_date = dates[0]
        meta.discharge_date = dates[1]
    elif dates:
        meta.admission_date = dates[0]

    # Total amount — look for grand total / net total patterns
    total_patterns = [
        r"(?:grand\s*total|net\s*total|total\s*amount|amount\s*payable|net\s*payable)[:\s]*[₹Rs.INR\s]*([0-9,]+\.?\d*)",
        r"(?:total)[:\s]*[₹Rs.INR\s]*([0-9,]+\.?\d*)",
    ]
    for pattern in total_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                meta.total_amount = float(match.group(1).replace(",", ""))
                break
            except ValueError:
                continue

    return meta


# ── Line Item Extraction ──────────────────────────────────────────

def _extract_line_items(text: str) -> list[ParsedLineItem]:
    """
    Extract line items from bill text.
    Handles multiple formats:
      - "1  Semi-Private Room  5  8500.00  42500.00"
      - "Room Charges | 1 | 2500.00 | 2500.00"
      - "Room Charges    2500.00"
    """
    items = []

    # ── Strategy 1: Row-by-row column splitting ───────────────
    # Split each line on 2+ whitespace chunks, look for numeric columns at the end
    lines = text.strip().split("\n")
    for line in lines:
        line = line.strip()
        if not line or line.startswith("-") or len(line) < 10:
            continue

        # Split on 2+ spaces (typical column separator in tabular bills)
        parts = re.split(r"\s{2,}", line)
        # Remove empty parts
        parts = [p.strip() for p in parts if p.strip()]

        if len(parts) < 3:
            continue

        # Try to identify: [serial?] [description] [qty] [rate] [amount]
        # Find where the description ends and numbers begin
        desc_parts = []
        num_parts = []

        for part in parts:
            # Check if this part is a number (possibly with commas and decimals)
            cleaned = part.replace(",", "").replace("₹", "").replace("Rs.", "").strip()
            if re.match(r"^\d+\.?\d*$", cleaned) and num_parts or (
                re.match(r"^\d+\.?\d*$", cleaned) and not desc_parts
            ):
                num_parts.append(cleaned)
            elif re.match(r"^\d+\.?\d*$", cleaned) and len(desc_parts) > 0:
                num_parts.append(cleaned)
            else:
                # If we already started collecting numbers and hit text, reset
                if num_parts:
                    desc_parts.extend(num_parts)
                    num_parts = []
                desc_parts.append(part)

        description = " ".join(desc_parts)

        # Remove leading serial number (e.g., "1 Semi-Private..." or "1. Room...")
        description = re.sub(r"^\d+[\.\)\-\s]+", "", description).strip()

        if _is_header_or_noise(description):
            continue
        if len(description) < 4:
            continue

        if len(num_parts) >= 3:
            # qty, rate, amount
            try:
                qty = float(num_parts[-3])
                unit_price = float(num_parts[-2])
                total_price = float(num_parts[-1])
                items.append(ParsedLineItem(
                    raw_description=description,
                    quantity=qty,
                    unit_price=unit_price,
                    total_price=total_price,
                    confidence=0.85,
                ))
            except (ValueError, IndexError):
                continue
        elif len(num_parts) == 2:
            # Could be qty+amount or rate+amount
            try:
                total_price = float(num_parts[-1])
                qty_or_rate = float(num_parts[0])
                if total_price < 1 or total_price > 10_000_000:
                    continue
                items.append(ParsedLineItem(
                    raw_description=description,
                    quantity=qty_or_rate if qty_or_rate < 100 else 1.0,
                    unit_price=total_price / max(qty_or_rate, 1) if qty_or_rate < 100 else qty_or_rate,
                    total_price=total_price,
                    confidence=0.7,
                ))
            except (ValueError, IndexError):
                continue
        elif len(num_parts) == 1:
            try:
                total_price = float(num_parts[0])
                if total_price < 10 or total_price > 10_000_000:
                    continue
                items.append(ParsedLineItem(
                    raw_description=description,
                    quantity=1.0,
                    unit_price=total_price,
                    total_price=total_price,
                    confidence=0.5,
                ))
            except ValueError:
                continue

    # ── Strategy 2 (fallback): Regex for inline patterns ──────
    if len(items) < 3:
        # Try matching "Description  qty  rate  amount" with regex
        pattern = re.compile(
            r"^\s*\d*[\.\)\-\s]*"              # Optional serial number
            r"(.+?)\s+"                        # Description (non-greedy)
            r"(\d+)\s+"                        # Quantity
            r"(\d[\d,]*\.?\d*)\s+"             # Unit price
            r"(\d[\d,]*\.?\d*)\s*$",           # Total
            re.MULTILINE,
        )
        for match in pattern.finditer(text):
            desc = match.group(1).strip()
            if _is_header_or_noise(desc) or len(desc) < 4:
                continue
            if any(item.raw_description == desc for item in items):
                continue
            try:
                items.append(ParsedLineItem(
                    raw_description=desc,
                    quantity=float(match.group(2)),
                    unit_price=float(match.group(3).replace(",", "")),
                    total_price=float(match.group(4).replace(",", "")),
                    confidence=0.8,
                ))
            except ValueError:
                continue

    return items


def _is_header_or_noise(text: str) -> bool:
    """Filter out headers, footers, and non-data rows."""
    noise_words = [
        "description", "particular", "amount", "total", "subtotal",
        "sr no", "sl no", "item", "qty", "rate", "page", "date",
        "bill no", "invoice", "patient", "doctor", "hospital",
        "gst", "cgst", "sgst", "tax", "discount", "advance",
    ]
    lower = text.lower().strip()
    if len(lower) < 5:
        return True
    if any(lower.startswith(w) for w in noise_words):
        return True
    # Mostly numbers = probably a header row
    if sum(c.isdigit() for c in lower) > len(lower) * 0.6:
        return True
    return False


# ── Category Classification ───────────────────────────────────────

def _classify_item(description: str) -> str:
    """
    Classify a line item into a medical category.
    Uses keyword matching first, then fuzzy matching as fallback.
    """
    lower = description.lower()

    # Exact keyword matching
    best_category = "OTHER"
    best_score = 0

    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                score = len(kw)  # Longer match = more specific
                if score > best_score:
                    best_score = score
                    best_category = category

    if best_category != "OTHER":
        return best_category

    # Fuzzy matching fallback
    try:
        from rapidfuzz import fuzz
        best_ratio = 0
        for category, keywords in CATEGORY_KEYWORDS.items():
            for kw in keywords:
                ratio = fuzz.partial_ratio(lower, kw)
                if ratio > best_ratio and ratio > 70:
                    best_ratio = ratio
                    best_category = category
    except ImportError:
        pass

    return best_category


def _normalize_description(description: str) -> str:
    """Clean up and normalize item descriptions."""
    # Remove extra whitespace
    text = re.sub(r"\s+", " ", description).strip()
    # Remove leading serial numbers
    text = re.sub(r"^\d+[\.\)\-\s]+", "", text).strip()
    # Title case
    text = text.title()
    return text
