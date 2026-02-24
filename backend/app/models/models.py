"""
BillSentry Health - SQLAlchemy ORM Models
Complete data model derived from PRD/TRD ERD specifications.
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey,
    Enum as SAEnum, Boolean, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


# ── Enums ──────────────────────────────────────────────────────────

class BillStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class LineItemFlag(str, enum.Enum):
    OK = "OK"
    SUSPICIOUS = "SUSPICIOUS"
    OVERCHARGED = "OVERCHARGED"


class LineItemCategory(str, enum.Enum):
    ROOM = "ROOM"
    ICU = "ICU"
    SURGERY_FEE = "SURGERY_FEE"
    LAB_TEST = "LAB_TEST"
    MEDICINE = "MEDICINE"
    CONSUMABLE = "CONSUMABLE"
    DIAGNOSTICS = "DIAGNOSTICS"
    PROFESSIONAL_FEE = "PROFESSIONAL_FEE"
    MISCELLANEOUS = "MISCELLANEOUS"
    OTHER = "OTHER"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class DisputeTarget(str, enum.Enum):
    HOSPITAL = "HOSPITAL"
    INSURER = "INSURER"
    CONSUMER_COURT = "CONSUMER_COURT"


class DisputeStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    FINAL = "FINAL"


class PaymentProvider(str, enum.Enum):
    RAZORPAY = "RAZORPAY"
    STRIPE = "STRIPE"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class AdminRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MEDICAL_ADVISOR = "MEDICAL_ADVISOR"


class BenchmarkSource(str, enum.Enum):
    CGHS = "CGHS"
    PMJAY = "PMJAY"
    NPPA = "NPPA"
    STATE_RATE_CARD = "STATE_RATE_CARD"


# ── Models ─────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    bills = relationship("HospitalBill", back_populates="user")
    payments = relationship("Payment", back_populates="user")


class HospitalBill(Base):
    __tablename__ = "hospital_bills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String(512), nullable=False)
    hospital_name = Column(String(255), nullable=True)
    hospital_city = Column(String(100), nullable=True)
    admission_date = Column(DateTime, nullable=True)
    discharge_date = Column(DateTime, nullable=True)
    total_amount = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    status = Column(SAEnum(BillStatus), default=BillStatus.UPLOADED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="bills")
    line_items = relationship("BillLineItem", back_populates="bill")
    audit_report = relationship("AuditReport", back_populates="bill", uselist=False)
    dispute_letters = relationship("DisputeLetter", back_populates="bill")
    payments = relationship("Payment", back_populates="bill")


class BillLineItem(Base):
    __tablename__ = "bill_line_items"

    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("hospital_bills.id"), nullable=False)
    raw_description = Column(Text, nullable=True)
    normalized_code = Column(String(100), nullable=True)
    normalized_category = Column(SAEnum(LineItemCategory), default=LineItemCategory.OTHER)
    unit_price = Column(Float, nullable=True)
    quantity = Column(Float, default=1.0)
    total_price = Column(Float, nullable=True)
    flag = Column(SAEnum(LineItemFlag), default=LineItemFlag.OK)
    flag_reason = Column(Text, nullable=True)
    benchmark_min = Column(Float, nullable=True)
    benchmark_max = Column(Float, nullable=True)
    benchmark_source = Column(SAEnum(BenchmarkSource), nullable=True)

    # Relationships
    bill = relationship("HospitalBill", back_populates="line_items")


class PriceRule(Base):
    __tablename__ = "price_rules"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(SAEnum(LineItemCategory), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    scheme = Column(String(100), nullable=True)
    benchmark_min = Column(Float, nullable=False)
    benchmark_max = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)
    source_url = Column(String(512), nullable=True)
    source = Column(SAEnum(BenchmarkSource), nullable=True)
    effective_from = Column(DateTime, nullable=True)
    effective_to = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditReport(Base):
    __tablename__ = "audit_reports"

    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("hospital_bills.id"), unique=True, nullable=False)
    summary_json = Column(JSON, nullable=True)
    total_flagged_amount = Column(Float, default=0.0)
    potential_recovery_amount = Column(Float, default=0.0)
    risk_level = Column(SAEnum(RiskLevel), default=RiskLevel.LOW)
    plain_language_summary = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    report_pdf_url = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    bill = relationship("HospitalBill", back_populates="audit_report")


class DisputeLetter(Base):
    __tablename__ = "dispute_letters"

    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("hospital_bills.id"), nullable=False)
    target = Column(SAEnum(DisputeTarget), default=DisputeTarget.HOSPITAL)
    language = Column(String(10), default="EN")
    content = Column(Text, nullable=True)
    status = Column(SAEnum(DisputeStatus), default=DisputeStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    bill = relationship("HospitalBill", back_populates="dispute_letters")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bill_id = Column(Integer, ForeignKey("hospital_bills.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    provider = Column(SAEnum(PaymentProvider), nullable=True)
    provider_payment_id = Column(String(255), nullable=True)
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="payments")
    bill = relationship("HospitalBill", back_populates="payments")


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    role = Column(SAEnum(AdminRole), default=AdminRole.ADMIN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RateSourceImport(Base):
    __tablename__ = "rate_source_imports"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(255), nullable=False)
    file_url = Column(String(512), nullable=True)
    status = Column(String(50), default="PENDING")
    imported_at = Column(DateTime(timezone=True), server_default=func.now())
