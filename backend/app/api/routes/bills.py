"""
BillSentry Health - Bill Management Routes
Handles bill upload, processing, status tracking, and line item retrieval.
"""

import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.core.config import settings
from app.core.security import decode_access_token, oauth2_scheme
from app.models.models import HospitalBill, BillLineItem, BillStatus
from app.schemas.schemas import BillUploadResponse, BillOut, LineItemOut

router = APIRouter(prefix="/bills", tags=["Bills"])


def _get_user_id(token: str) -> int:
    payload = decode_access_token(token)
    return int(payload["sub"])


@router.post("/", response_model=BillUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_bill(
    file: UploadFile = File(...),
    hospital_name: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Upload a hospital bill PDF for analysis."""
    user_id = _get_user_id(token)

    # Validate file
    if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, and PNG files are supported")

    file_size_mb = 0
    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    # Save locally for MVP (swap with S3 in production)
    upload_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Create DB record
    bill = HospitalBill(
        user_id=user_id,
        file_url=file_path,
        hospital_name=hospital_name,
        hospital_city=city,
        status=BillStatus.UPLOADED,
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)

    # Auto-process if sync mode is enabled
    message = "Bill uploaded successfully."
    if settings.SYNC_PROCESSING:
        from app.services.tasks import process_bill
        result = process_bill(bill.id, db)
        if result.get("error"):
            message += f" Processing error: {result['error']}"
        else:
            message += (
                f" Processing complete: {result.get('line_items_count', 0)} items analyzed, "
                f"risk level: {result.get('risk_level', 'N/A')}"
            )
    else:
        message += " Processing will begin shortly."

    # Refresh status
    db.refresh(bill)

    return BillUploadResponse(
        bill_id=bill.id,
        status=bill.status.value,
        message=message,
    )


@router.post("/{bill_id}/process")
def trigger_processing(
    bill_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Manually trigger (or re-trigger) bill processing."""
    user_id = _get_user_id(token)
    bill = db.query(HospitalBill).filter(
        HospitalBill.id == bill_id,
        HospitalBill.user_id == user_id,
    ).first()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    # Clear existing line items if re-processing
    db.query(BillLineItem).filter(BillLineItem.bill_id == bill_id).delete()
    db.commit()

    from app.services.tasks import process_bill
    result = process_bill(bill_id, db)

    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])

    return result


@router.get("/", response_model=List[BillOut])
def list_bills(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """List all bills for the authenticated user."""
    user_id = _get_user_id(token)
    bills = db.query(HospitalBill).filter(HospitalBill.user_id == user_id).order_by(HospitalBill.created_at.desc()).all()
    return bills


@router.get("/{bill_id}", response_model=BillOut)
def get_bill(bill_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get details of a specific bill."""
    user_id = _get_user_id(token)
    bill = db.query(HospitalBill).filter(HospitalBill.id == bill_id, HospitalBill.user_id == user_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill


@router.get("/{bill_id}/items", response_model=List[LineItemOut])
def get_bill_items(bill_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get line items for a specific bill with flags and benchmark comparisons."""
    user_id = _get_user_id(token)
    bill = db.query(HospitalBill).filter(HospitalBill.id == bill_id, HospitalBill.user_id == user_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    items = db.query(BillLineItem).filter(BillLineItem.bill_id == bill_id).all()
    return items
