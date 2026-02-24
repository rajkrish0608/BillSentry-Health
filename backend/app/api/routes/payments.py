"""
BillSentry Health - Payment Routes
Handles payment order creation and webhook processing.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import decode_access_token, oauth2_scheme
from app.models.models import Payment, PaymentStatus, PaymentProvider, HospitalBill
from app.schemas.schemas import PaymentCreateRequest, PaymentCreateResponse
from app.services.payment_service import create_payment_order, verify_payment_signature

router = APIRouter(prefix="/payments", tags=["Payments"])

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# Pricing tiers (in INR)
PLAN_PRICING = {
    "DISPUTE_LETTER": 299.0,
}

def _get_user_id(token: str) -> int:
    payload = decode_access_token(token)
    return int(payload["sub"])

@router.post("/create-order", response_model=PaymentCreateResponse)
def create_order(
    payload: PaymentCreateRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Create a payment order for a dispute letter."""
    user_id = _get_user_id(token)

    if payload.plan not in PLAN_PRICING:
        raise HTTPException(status_code=400, detail="Invalid plan selected")

    amount = PLAN_PRICING[payload.plan]
    
    # Check if bill exists
    bill = db.query(HospitalBill).filter(
        HospitalBill.id == payload.bill_id, 
        HospitalBill.user_id == user_id
    ).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    # Create payment record
    payment = Payment(
        user_id=user_id,
        bill_id=payload.bill_id,
        amount=amount,
        currency="INR",
        provider=PaymentProvider.RAZORPAY,
        status=PaymentStatus.PENDING,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Call Razorpay Service
    receipt_id = f"rcpt_{payment.id}"
    order = create_payment_order(amount, receipt_id)
    
    # Store order ID
    payment.provider_payment_id = order.get("id")
    db.commit()

    return PaymentCreateResponse(
        order_id=order.get("id"),
        amount=amount,
        currency="INR",
    )

@router.post("/verify")
def verify_payment(
    payload: PaymentVerifyRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Verify Razorpay payment signature and mark as SUCCESS."""
    user_id = _get_user_id(token)
    
    is_valid = verify_payment_signature(
        payload.razorpay_order_id, 
        payload.razorpay_payment_id, 
        payload.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
        
    payment = db.query(Payment).filter(
        Payment.provider_payment_id == payload.razorpay_order_id,
        Payment.user_id == user_id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    payment.status = PaymentStatus.SUCCESS
    db.commit()
    
    return {"status": "success", "message": "Payment verified successfully"}
