"""
BillSentry Health - Payment Routes
Handles payment order creation and webhook processing.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token, oauth2_scheme
from app.models.models import Payment, PaymentStatus, PaymentProvider
from app.schemas.schemas import PaymentCreateRequest, PaymentCreateResponse, PaymentOut

router = APIRouter(prefix="/payments", tags=["Payments"])

# Pricing tiers (in INR)
PLAN_PRICING = {
    "BASIC_AUDIT": 499.0,
    "FULL_DISPUTE": 1999.0,
}


def _get_user_id(token: str) -> int:
    payload = decode_access_token(token)
    return int(payload["sub"])


@router.post("/create-order", response_model=PaymentCreateResponse)
def create_payment_order(
    payload: PaymentCreateRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Create a payment order for a billing plan."""
    user_id = _get_user_id(token)

    if payload.plan not in PLAN_PRICING:
        raise HTTPException(status_code=400, detail="Invalid plan selected")

    amount = PLAN_PRICING[payload.plan]

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

    # TODO: Integrate with Razorpay/Stripe SDK to create actual order
    # For now, return a mock order_id
    return PaymentCreateResponse(
        order_id=f"order_billsentry_{payment.id}",
        amount=amount,
        currency="INR",
    )


@router.post("/webhook")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle payment provider webhook callbacks."""
    body = await request.json()

    # TODO: Verify webhook signature from Razorpay/Stripe
    # TODO: Update payment status and unlock full report/letter

    return {"status": "received"}
