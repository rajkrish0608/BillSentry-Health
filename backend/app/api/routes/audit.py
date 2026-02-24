"""
BillSentry Health - Audit & Dispute Routes
Handles audit report retrieval and dispute letter generation.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import decode_access_token, oauth2_scheme
from app.models.models import HospitalBill, AuditReport, DisputeLetter
from app.schemas.schemas import AuditReportOut, DisputeLetterOut

router = APIRouter(tags=["Audit & Dispute"])


def _get_user_id(token: str) -> int:
    payload = decode_access_token(token)
    return int(payload["sub"])


@router.get("/bills/{bill_id}/audit-report", response_model=AuditReportOut)
def get_audit_report(bill_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the audit report for a specific bill."""
    user_id = _get_user_id(token)
    bill = db.query(HospitalBill).filter(HospitalBill.id == bill_id, HospitalBill.user_id == user_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    report = db.query(AuditReport).filter(AuditReport.bill_id == bill_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Audit report not yet generated")
    return report


@router.get("/bills/{bill_id}/dispute-letter")
def get_dispute_letter(
    bill_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Generate and download a PDF dispute letter for overcharged items."""
    from app.services.pdf_generator import generate_dispute_letter
    user_id = _get_user_id(token)
    
    try:
        pdf_bytes = generate_dispute_letter(bill_id, user_id, db)
        
        return StreamingResponse(
            pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=dispute_letter_{bill_id}.pdf"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate dispute letter")
