"""
BillSentry Health - Processing Pipeline
Orchestrates: Upload → OCR → NLP Parse → Benchmark → Audit Report

Can run:
  - Synchronously (inline, for dev/testing)
  - Asynchronously (via Celery, for production)
"""

import json
import logging
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.models import (
    HospitalBill, BillLineItem, AuditReport,
    BillStatus, LineItemFlag, LineItemCategory, BenchmarkSource, RiskLevel,
)
from app.services.ocr_service import extract_text
from app.services.nlp_parser import parse_bill_text
from app.services.benchmark_service import (
    compare_line_item, detect_duplicates, calculate_risk_level,
)

logger = logging.getLogger(__name__)


def process_bill(bill_id: int, db: Session) -> dict:
    """
    Full processing pipeline for a hospital bill.
    Returns a summary dict with results.
    """
    # Fetch the bill
    bill = db.query(HospitalBill).filter(HospitalBill.id == bill_id).first()
    if not bill:
        return {"error": f"Bill {bill_id} not found"}

    try:
        # ── Stage 1: OCR ──────────────────────────────────────────
        bill.status = BillStatus.PROCESSING
        db.commit()
        logger.info(f"[Bill {bill_id}] Stage 1: OCR extraction from {bill.file_url}")

        ocr_result = extract_text(bill.file_url)

        if ocr_result.error:
            bill.status = BillStatus.FAILED
            db.commit()
            return {"error": f"OCR failed: {ocr_result.error}"}

        if not ocr_result.raw_text.strip():
            bill.status = BillStatus.FAILED
            db.commit()
            return {"error": "OCR produced no text"}

        logger.info(f"[Bill {bill_id}] OCR: {len(ocr_result.raw_text)} chars, "
                     f"method={ocr_result.method}, confidence={ocr_result.confidence}")

        # ── Stage 2: NLP Parsing ──────────────────────────────────
        logger.info(f"[Bill {bill_id}] Stage 2: NLP parsing")
        parse_result = parse_bill_text(ocr_result.raw_text)

        if parse_result.error:
            bill.status = BillStatus.FAILED
            db.commit()
            return {"error": f"Parse failed: {parse_result.error}"}

        # Update bill metadata from parsed data
        if parse_result.metadata.hospital_name and not bill.hospital_name:
            bill.hospital_name = parse_result.metadata.hospital_name
        if parse_result.metadata.total_amount:
            bill.total_amount = parse_result.metadata.total_amount

        logger.info(f"[Bill {bill_id}] Parsed {len(parse_result.line_items)} line items")

        # ── Stage 3: Benchmark Comparison ─────────────────────────
        logger.info(f"[Bill {bill_id}] Stage 3: Benchmark comparison")

        total_billed = 0.0
        total_flagged = 0.0
        num_overcharged = 0
        line_item_records = []

        for item in parse_result.line_items:
            # Compare against benchmarks
            benchmark = compare_line_item(
                description=item.raw_description,
                category=item.category,
                total_price=item.total_price,
                city=bill.hospital_city,
                db=db,
            )

            # Create line item record
            try:
                cat_enum = LineItemCategory(item.category)
            except (ValueError, KeyError):
                cat_enum = LineItemCategory.OTHER

            try:
                flag_enum = LineItemFlag(benchmark.flag)
            except (ValueError, KeyError):
                flag_enum = LineItemFlag.OK

            try:
                source_enum = BenchmarkSource(benchmark.benchmark_source) if benchmark.benchmark_source else None
            except (ValueError, KeyError):
                source_enum = None

            line_item = BillLineItem(
                bill_id=bill_id,
                raw_description=item.raw_description,
                normalized_code=item.normalized_description,
                normalized_category=cat_enum,
                unit_price=item.unit_price,
                quantity=item.quantity,
                total_price=item.total_price,
                flag=flag_enum,
                flag_reason=benchmark.flag_reason,
                benchmark_min=benchmark.benchmark_min if benchmark.matched else None,
                benchmark_max=benchmark.benchmark_max if benchmark.matched else None,
                benchmark_source=source_enum,
            )
            db.add(line_item)
            line_item_records.append(line_item)

            total_billed += item.total_price
            if benchmark.flag in ("SUSPICIOUS", "OVERCHARGED"):
                excess = item.total_price - benchmark.benchmark_max if benchmark.matched else 0
                total_flagged += max(0, excess)
                if benchmark.flag == "OVERCHARGED":
                    num_overcharged += 1

        # ── Stage 4: Duplicate Detection ──────────────────────────
        item_dicts = [
            {"description": item.raw_description, "total_price": item.total_price}
            for item in parse_result.line_items
        ]
        duplicates = detect_duplicates(item_dicts)
        if duplicates:
            logger.info(f"[Bill {bill_id}] Found {len(duplicates)} potential duplicate charges")

        # ── Stage 5: Generate Audit Report ────────────────────────
        logger.info(f"[Bill {bill_id}] Stage 4: Generating audit report")

        risk = calculate_risk_level(total_flagged, total_billed, num_overcharged)

        # Build summary JSON
        summary = {
            "ocr_method": ocr_result.method,
            "ocr_confidence": ocr_result.confidence,
            "total_line_items": len(parse_result.line_items),
            "total_billed": round(total_billed, 2),
            "total_flagged_amount": round(total_flagged, 2),
            "num_ok": sum(1 for r in line_item_records if r.flag == LineItemFlag.OK),
            "num_suspicious": sum(1 for r in line_item_records if r.flag == LineItemFlag.SUSPICIOUS),
            "num_overcharged": num_overcharged,
            "potential_duplicates": len(duplicates),
            "duplicate_pairs": [
                {"item_a": d[0], "item_b": d[1], "similarity": d[2]}
                for d in duplicates
            ],
            "hospital_name": parse_result.metadata.hospital_name,
            "bill_number": parse_result.metadata.bill_number,
            "categories_breakdown": _category_breakdown(parse_result.line_items),
        }

        # Plain language summary
        plain_summary = _generate_plain_summary(summary, risk)

        # Confidence score: weighted average of OCR confidence and benchmark coverage
        benchmark_coverage = sum(
            1 for r in line_item_records if r.benchmark_min is not None
        ) / max(len(line_item_records), 1)
        confidence_score = round(
            ocr_result.confidence * 0.4 + benchmark_coverage * 0.4 + 0.2, 3
        )

        try:
            risk_enum = RiskLevel(risk)
        except (ValueError, KeyError):
            risk_enum = RiskLevel.LOW

        # Check for existing report
        existing_report = db.query(AuditReport).filter(
            AuditReport.bill_id == bill_id
        ).first()
        if existing_report:
            db.delete(existing_report)

        report = AuditReport(
            bill_id=bill_id,
            summary_json=summary,
            total_flagged_amount=round(total_flagged, 2),
            potential_recovery_amount=round(total_flagged * 0.8, 2),  # Conservative estimate
            risk_level=risk_enum,
            plain_language_summary=plain_summary,
            confidence_score=confidence_score,
        )
        db.add(report)

        # Mark bill as completed
        bill.status = BillStatus.COMPLETED
        db.commit()

        logger.info(
            f"[Bill {bill_id}] ✅ Processing complete. "
            f"{len(parse_result.line_items)} items, "
            f"risk={risk}, flagged=₹{total_flagged:,.0f}"
        )

        return {
            "success": True,
            "bill_id": bill_id,
            "line_items_count": len(parse_result.line_items),
            "risk_level": risk,
            "total_flagged": round(total_flagged, 2),
            "confidence_score": confidence_score,
        }

    except Exception as e:
        logger.error(f"[Bill {bill_id}] Pipeline error: {e}", exc_info=True)
        bill.status = BillStatus.FAILED
        db.commit()
        return {"error": str(e)}


def _category_breakdown(items) -> dict:
    """Aggregate spending by category."""
    breakdown = {}
    for item in items:
        cat = item.category
        if cat not in breakdown:
            breakdown[cat] = {"count": 0, "total": 0.0}
        breakdown[cat]["count"] += 1
        breakdown[cat]["total"] = round(breakdown[cat]["total"] + item.total_price, 2)
    return breakdown


def _generate_plain_summary(summary: dict, risk: str) -> str:
    """Generate a human-readable audit summary."""
    total = summary["total_billed"]
    flagged = summary["total_flagged_amount"]
    n_items = summary["total_line_items"]
    n_over = summary["num_overcharged"]
    n_sus = summary["num_suspicious"]

    lines = []
    lines.append(f"Audit analysis of your hospital bill with {n_items} line items "
                 f"totaling ₹{total:,.0f}.")

    if n_over > 0 or n_sus > 0:
        lines.append(
            f"\n⚠ We found {n_over + n_sus} items with pricing concerns — "
            f"{n_over} appear overcharged and {n_sus} have elevated variance "
            f"compared to government benchmarks."
        )
        if flagged > 0:
            lines.append(
                f"The estimated excess amount is ₹{flagged:,.0f}, representing "
                f"a potential recovery of ₹{flagged * 0.8:,.0f} (conservative estimate)."
            )
    else:
        lines.append(
            "\n✅ All line items appear to be within acceptable ranges based on "
            "available benchmark data."
        )

    if summary.get("potential_duplicates", 0) > 0:
        lines.append(
            f"\n🔍 We also detected {summary['potential_duplicates']} potential "
            f"duplicate charge(s) that warrant review."
        )

    risk_labels = {
        "LOW": "Low risk — charges are generally in line with benchmarks.",
        "MEDIUM": "Medium risk — several items exceed expected pricing.",
        "HIGH": "High risk — significant overcharging detected across multiple items.",
    }

    lines.append(f"\nOverall Risk Level: {risk} — {risk_labels.get(risk, '')}")

    return "\n".join(lines)
