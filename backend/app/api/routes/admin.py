import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.models.models import User, HospitalBill, AuditReport, PriceRule, LineItemCategory, BenchmarkSource

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/metrics")
def get_global_metrics(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get global platform metrics for the admin dashboard."""
    total_users = db.query(User).count()
    total_bills = db.query(HospitalBill).count()
    
    # Calculate total overcharges and recoveries
    totals = db.query(
        func.sum(AuditReport.total_flagged_amount).label('total_flagged'),
        func.sum(AuditReport.potential_recovery_amount).label('total_recovery')
    ).first()
    
    return {
        "total_users": total_users,
        "total_bills_processed": total_bills,
        "total_overcharges_detected": totals.total_flagged or 0,
        "total_potential_recovery": totals.total_recovery or 0,
    }

@router.get("/benchmarks")
def list_benchmarks(
    skip: int = 0, 
    limit: int = 100,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """List all current government benchmark rate rules (paginated)."""
    rules = db.query(PriceRule).offset(skip).limit(limit).all()
    total = db.query(PriceRule).count()
    return {
        "total": total,
        "items": rules
    }

@router.post("/benchmarks/upload")
async def upload_benchmarks(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Upload a CSV to bulk insert new government benchmark rates."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    count = 0
    for row in reader:
        # Example CSV Format: code,name,category,city,benchmark_max,source
        try:
            category_enum = LineItemCategory[row.get('category', 'OTHER')]
        except KeyError:
            category_enum = LineItemCategory.OTHER
            
        try:
            source_enum = BenchmarkSource[row.get('source', 'CGHS')]
        except KeyError:
            source_enum = BenchmarkSource.CGHS

        new_rule = PriceRule(
            code=row.get('code', f"IMP{count}"),
            name=row.get('name'),
            category=category_enum,
            city=row.get('city'),
            benchmark_min=float(row.get('benchmark_min', 0)),
            benchmark_max=float(row.get('benchmark_max', 0)),
            source=source_enum
        )
        db.add(new_rule)
        count += 1
        
    db.commit()
    return {"message": f"Successfully imported {count} benchmark rates."}
