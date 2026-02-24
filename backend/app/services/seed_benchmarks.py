"""
BillSentry Health - Benchmark Seed Data
Seeds the PriceRule table with representative CGHS/PMJAY/NPPA rates for MVP demo.

Run: python -m app.services.seed_benchmarks
"""

import logging
from app.core.database import SessionLocal, engine, Base
from app.models.models import PriceRule, BenchmarkSource, LineItemCategory

logger = logging.getLogger(__name__)


# ── Sample CGHS Rates (Central Government Health Scheme) ──────────
CGHS_RATES = [
    # Room & Accommodation
    {"code": "ROOM-GW", "name": "General Ward Room Charges", "category": "ROOM",
     "min": 800, "max": 1500, "unit": "per day", "source": "CGHS"},
    {"code": "ROOM-SP", "name": "Semi-Private Room Charges", "category": "ROOM",
     "min": 2000, "max": 3500, "unit": "per day", "source": "CGHS"},
    {"code": "ROOM-PV", "name": "Private Room Charges", "category": "ROOM",
     "min": 3500, "max": 6000, "unit": "per day", "source": "CGHS"},
    {"code": "ROOM-DLX", "name": "Deluxe Room Charges", "category": "ROOM",
     "min": 5000, "max": 10000, "unit": "per day", "source": "CGHS"},

    # ICU
    {"code": "ICU-GEN", "name": "ICU Charges General", "category": "ICU",
     "min": 3500, "max": 7500, "unit": "per day", "source": "CGHS"},
    {"code": "ICU-VEN", "name": "ICU with Ventilator", "category": "ICU",
     "min": 5000, "max": 12000, "unit": "per day", "source": "CGHS"},

    # Surgery
    {"code": "SURG-MIN", "name": "Minor Surgery / Procedure", "category": "SURGERY_FEE",
     "min": 5000, "max": 15000, "unit": "per procedure", "source": "CGHS"},
    {"code": "SURG-MAJ", "name": "Major Surgery", "category": "SURGERY_FEE",
     "min": 25000, "max": 80000, "unit": "per procedure", "source": "CGHS"},
    {"code": "SURG-OT", "name": "Operation Theatre Charges", "category": "SURGERY_FEE",
     "min": 3000, "max": 15000, "unit": "per hour", "source": "CGHS"},
    {"code": "SURG-ANES", "name": "Anaesthesia Charges", "category": "SURGERY_FEE",
     "min": 2000, "max": 10000, "unit": "per procedure", "source": "CGHS"},

    # Lab Tests
    {"code": "LAB-CBC", "name": "Complete Blood Count CBC", "category": "LAB_TEST",
     "min": 150, "max": 500, "unit": "per test", "source": "CGHS"},
    {"code": "LAB-LFT", "name": "Liver Function Test LFT", "category": "LAB_TEST",
     "min": 300, "max": 800, "unit": "per test", "source": "CGHS"},
    {"code": "LAB-KFT", "name": "Kidney Function Test KFT", "category": "LAB_TEST",
     "min": 300, "max": 700, "unit": "per test", "source": "CGHS"},
    {"code": "LAB-LIPID", "name": "Lipid Profile", "category": "LAB_TEST",
     "min": 250, "max": 600, "unit": "per test", "source": "CGHS"},
    {"code": "LAB-THYROID", "name": "Thyroid Profile T3 T4 TSH", "category": "LAB_TEST",
     "min": 300, "max": 900, "unit": "per test", "source": "CGHS"},
    {"code": "LAB-HBA1C", "name": "HbA1c Glycated Hemoglobin", "category": "LAB_TEST",
     "min": 250, "max": 600, "unit": "per test", "source": "CGHS"},
    {"code": "LAB-URINE", "name": "Urine Routine Examination", "category": "LAB_TEST",
     "min": 80, "max": 250, "unit": "per test", "source": "CGHS"},
    {"code": "LAB-CULTURE", "name": "Blood Culture Sensitivity", "category": "LAB_TEST",
     "min": 400, "max": 1200, "unit": "per test", "source": "CGHS"},

    # Diagnostics
    {"code": "DIAG-XRAY", "name": "X-Ray Single View", "category": "DIAGNOSTICS",
     "min": 200, "max": 600, "unit": "per view", "source": "CGHS"},
    {"code": "DIAG-USG", "name": "Ultrasound USG Abdomen", "category": "DIAGNOSTICS",
     "min": 500, "max": 1500, "unit": "per scan", "source": "CGHS"},
    {"code": "DIAG-CT", "name": "CT Scan Plain", "category": "DIAGNOSTICS",
     "min": 2000, "max": 5000, "unit": "per scan", "source": "CGHS"},
    {"code": "DIAG-CT-CON", "name": "CT Scan with Contrast", "category": "DIAGNOSTICS",
     "min": 3000, "max": 8000, "unit": "per scan", "source": "CGHS"},
    {"code": "DIAG-MRI", "name": "MRI Scan", "category": "DIAGNOSTICS",
     "min": 4000, "max": 12000, "unit": "per scan", "source": "CGHS"},
    {"code": "DIAG-ECG", "name": "ECG Electrocardiogram", "category": "DIAGNOSTICS",
     "min": 100, "max": 350, "unit": "per test", "source": "CGHS"},
    {"code": "DIAG-ECHO", "name": "2D Echocardiography", "category": "DIAGNOSTICS",
     "min": 800, "max": 2500, "unit": "per test", "source": "CGHS"},

    # Professional Fees
    {"code": "PROF-CONSULT", "name": "Doctor Consultation Fee", "category": "PROFESSIONAL_FEE",
     "min": 300, "max": 1000, "unit": "per visit", "source": "CGHS"},
    {"code": "PROF-SPEC", "name": "Specialist Consultation Fee", "category": "PROFESSIONAL_FEE",
     "min": 500, "max": 2000, "unit": "per visit", "source": "CGHS"},
    {"code": "PROF-NURSING", "name": "Nursing Charges", "category": "PROFESSIONAL_FEE",
     "min": 500, "max": 1500, "unit": "per day", "source": "CGHS"},
]

# ── Sample PMJAY Package Rates ────────────────────────────────────
PMJAY_RATES = [
    {"code": "PMJAY-APPEN", "name": "Appendectomy Laparoscopic", "category": "SURGERY_FEE",
     "min": 15000, "max": 25000, "unit": "package", "source": "PMJAY"},
    {"code": "PMJAY-CHOL", "name": "Cholecystectomy Laparoscopic", "category": "SURGERY_FEE",
     "min": 18000, "max": 30000, "unit": "package", "source": "PMJAY"},
    {"code": "PMJAY-HERNIA", "name": "Hernia Repair", "category": "SURGERY_FEE",
     "min": 12000, "max": 22000, "unit": "package", "source": "PMJAY"},
    {"code": "PMJAY-CSEC", "name": "Caesarean Section", "category": "SURGERY_FEE",
     "min": 10000, "max": 18000, "unit": "package", "source": "PMJAY"},
    {"code": "PMJAY-DELIV", "name": "Normal Delivery", "category": "SURGERY_FEE",
     "min": 5000, "max": 10000, "unit": "package", "source": "PMJAY"},
    {"code": "PMJAY-DIAL", "name": "Dialysis Session", "category": "OTHER",
     "min": 1500, "max": 3000, "unit": "per session", "source": "PMJAY"},
]

# ── Sample NPPA Drug Ceiling Prices ───────────────────────────────
NPPA_RATES = [
    {"code": "NPPA-PARA500", "name": "Paracetamol 500mg Tablet", "category": "MEDICINE",
     "min": 1.0, "max": 2.5, "unit": "per tablet", "source": "NPPA"},
    {"code": "NPPA-AMOX500", "name": "Amoxicillin 500mg Capsule", "category": "MEDICINE",
     "min": 2.0, "max": 5.0, "unit": "per capsule", "source": "NPPA"},
    {"code": "NPPA-CEFT1G", "name": "Ceftriaxone 1g Injection", "category": "MEDICINE",
     "min": 15, "max": 40, "unit": "per vial", "source": "NPPA"},
    {"code": "NPPA-METRO", "name": "Metronidazole 400mg Tablet", "category": "MEDICINE",
     "min": 1.0, "max": 3.0, "unit": "per tablet", "source": "NPPA"},
    {"code": "NPPA-OMEP", "name": "Omeprazole 20mg Capsule", "category": "MEDICINE",
     "min": 2.0, "max": 6.0, "unit": "per capsule", "source": "NPPA"},
    {"code": "NPPA-INSULIN", "name": "Insulin Regular Human 40IU/ml", "category": "MEDICINE",
     "min": 50, "max": 120, "unit": "per vial", "source": "NPPA"},
    {"code": "NPPA-NS500", "name": "Normal Saline 500ml IV Fluid", "category": "MEDICINE",
     "min": 20, "max": 50, "unit": "per bottle", "source": "NPPA"},
    {"code": "NPPA-RL500", "name": "Ringer Lactate 500ml IV Fluid", "category": "MEDICINE",
     "min": 20, "max": 55, "unit": "per bottle", "source": "NPPA"},

    # Consumables
    {"code": "NPPA-SYRINGE", "name": "Disposable Syringe 5ml", "category": "CONSUMABLE",
     "min": 3, "max": 10, "unit": "per piece", "source": "NPPA"},
    {"code": "NPPA-CANNULA", "name": "IV Cannula", "category": "CONSUMABLE",
     "min": 15, "max": 50, "unit": "per piece", "source": "NPPA"},
    {"code": "NPPA-GLOVES", "name": "Surgical Gloves Sterile", "category": "CONSUMABLE",
     "min": 10, "max": 30, "unit": "per pair", "source": "NPPA"},
]


SOURCE_MAP = {
    "CGHS": BenchmarkSource.CGHS,
    "PMJAY": BenchmarkSource.PMJAY,
    "NPPA": BenchmarkSource.NPPA,
}

CATEGORY_MAP = {
    "ROOM": LineItemCategory.ROOM,
    "ICU": LineItemCategory.ICU,
    "SURGERY_FEE": LineItemCategory.SURGERY_FEE,
    "LAB_TEST": LineItemCategory.LAB_TEST,
    "MEDICINE": LineItemCategory.MEDICINE,
    "CONSUMABLE": LineItemCategory.CONSUMABLE,
    "DIAGNOSTICS": LineItemCategory.DIAGNOSTICS,
    "PROFESSIONAL_FEE": LineItemCategory.PROFESSIONAL_FEE,
    "MISCELLANEOUS": LineItemCategory.MISCELLANEOUS,
    "OTHER": LineItemCategory.OTHER,
}


def seed_all():
    """Insert all benchmark rates into the database."""
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(PriceRule).count()
        if existing > 0:
            print(f"⚠ Database already has {existing} benchmark rules. Skipping seed.")
            return

        all_rates = CGHS_RATES + PMJAY_RATES + NPPA_RATES
        count = 0

        for entry in all_rates:
            rule = PriceRule(
                code=entry["code"],
                name=entry["name"],
                category=CATEGORY_MAP.get(entry["category"]),
                benchmark_min=entry["min"],
                benchmark_max=entry["max"],
                unit=entry.get("unit"),
                source=SOURCE_MAP.get(entry["source"]),
            )
            db.add(rule)
            count += 1

        db.commit()
        print(f"✅ Seeded {count} benchmark rules ({len(CGHS_RATES)} CGHS, {len(PMJAY_RATES)} PMJAY, {len(NPPA_RATES)} NPPA)")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
