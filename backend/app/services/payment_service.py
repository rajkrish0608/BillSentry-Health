import razorpay
import hmac
import hashlib
from typing import Dict, Any
from app.core.config import settings

# Initialize Razorpay client only if keys are present (for local dev resilience)
try:
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception:
    client = None

def create_payment_order(amount_inr: float, receipt_id: str) -> Dict[str, Any]:
    """
    Creates a new Razorpay order for the specified amount.
    Amount is passed in INR (rupees). Razorpay expects paisa (amount * 100).
    """
    if not client:
        # Development fallback: simulate an order creation
        return {
            "id": f"order_dev_{receipt_id}",
            "amount": int(amount_inr * 100),
            "currency": "INR",
            "receipt": receipt_id,
            "status": "created"
        }
        
    data = {
        "amount": int(amount_inr * 100),
        "currency": "INR",
        "receipt": receipt_id,
        "payment_capture": 1 # Auto-capture
    }
    
    order = client.order.create(data=data)
    return order

def verify_payment_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """
    Verifies the Razorpay signature to prevent tampering.
    """
    if not client:
        # Development fallback: always return true if in dev mode without keys
        if razorpay_order_id.startswith("order_dev_"):
            return True
        return False
        
    try:
        payload = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(generated_signature, razorpay_signature)
    except Exception as e:
        print(f"Signature verification failed: {e}")
        return False
