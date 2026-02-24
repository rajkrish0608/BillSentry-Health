"""
BillSentry Health - Pydantic Schemas
Request/Response schemas for all API endpoints.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ── Auth ───────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str]
    phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Bill ───────────────────────────────────────────────────────────

class BillUploadResponse(BaseModel):
    bill_id: int
    status: str
    message: str


class BillOut(BaseModel):
    id: int
    user_id: int
    file_url: str
    hospital_name: Optional[str]
    hospital_city: Optional[str]
    total_amount: Optional[float]
    currency: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Line Items ─────────────────────────────────────────────────────

class LineItemOut(BaseModel):
    id: int
    raw_description: Optional[str]
    normalized_code: Optional[str]
    normalized_category: Optional[str]
    unit_price: Optional[float]
    quantity: Optional[float]
    total_price: Optional[float]
    flag: Optional[str]
    flag_reason: Optional[str]
    benchmark_min: Optional[float]
    benchmark_max: Optional[float]
    benchmark_source: Optional[str]

    class Config:
        from_attributes = True


# ── Audit Report ───────────────────────────────────────────────────

class AuditReportOut(BaseModel):
    id: int
    bill_id: int
    total_flagged_amount: float
    potential_recovery_amount: float
    risk_level: str
    plain_language_summary: Optional[str]
    confidence_score: Optional[float]
    report_pdf_url: Optional[str]
    summary_json: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Dispute Letter ─────────────────────────────────────────────────

class DisputeLetterOut(BaseModel):
    id: int
    bill_id: int
    target: str
    language: str
    content: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Payment ────────────────────────────────────────────────────────

class PaymentCreateRequest(BaseModel):
    bill_id: int
    plan: str  # BASIC_AUDIT, FULL_DISPUTE


class PaymentCreateResponse(BaseModel):
    order_id: str
    amount: float
    currency: str


class PaymentOut(BaseModel):
    id: int
    bill_id: Optional[int]
    amount: float
    currency: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
