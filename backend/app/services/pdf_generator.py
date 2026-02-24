import io
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import HospitalBill, BillLineItem, AuditReport, User
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch

def generate_dispute_letter(bill_id: int, user_id: int, db: Session) -> io.BytesIO:
    # Fetch Data
    bill = db.query(HospitalBill).filter(HospitalBill.id == bill_id, HospitalBill.user_id == user_id).first()
    if not bill:
        raise ValueError("Bill not found or access denied")
        
    user = db.query(User).filter(User.id == user_id).first()
    report = db.query(AuditReport).filter(AuditReport.bill_id == bill_id).first()
    
    # We only want to dispute items that are flagged as OVERCHARGED or SUSPICIOUS
    flagged_items = db.query(BillLineItem).filter(
        BillLineItem.bill_id == bill_id,
        BillLineItem.flag.in_(['SUSPICIOUS', 'OVERCHARGED'])
    ).all()

    if not flagged_items:
        raise ValueError("No overcharged or suspicious items found to dispute.")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Justify', alignment=4))
    
    elements = []
    
    # Header
    today = datetime.now().strftime("%B %d, %Y")
    elements.append(Paragraph(today, styles['Normal']))
    elements.append(Spacer(1, 0.25 * inch))
    
    # Sender Info
    sender_name = user.name or "Patient"
    elements.append(Paragraph(f"<b>From:</b> {sender_name}", styles['Normal']))
    elements.append(Paragraph(f"<b>Email:</b> {user.email}", styles['Normal']))
    if user.phone:
        elements.append(Paragraph(f"<b>Phone:</b> {user.phone}", styles['Normal']))
    elements.append(Spacer(1, 0.25 * inch))
    
    # Recipient Info
    hospital_name = bill.hospital_name or "Hospital Billing Department"
    elements.append(Paragraph(f"<b>To:</b> Billing Department, {hospital_name}", styles['Normal']))
    if bill.hospital_city:
        elements.append(Paragraph(bill.hospital_city, styles['Normal']))
    elements.append(Spacer(1, 0.25 * inch))
    
    # Subject
    bill_ref = f"Bill/Invoice No: {bill.invoice_number}" if bill.invoice_number else "Hospital Bill"
    elements.append(Paragraph(f"<b>SUBJECT: DISPUTE OF MEDICAL CHARGES - {bill_ref}</b>", styles['Heading3']))
    elements.append(Spacer(1, 0.25 * inch))
    
    # Body Preamble
    preamble = f"""
    Dear Billing Department,<br/><br/>
    I am writing to formally dispute several charges on the medical bill referenced above, dated {bill.created_at.strftime('%B %d, %Y')}. 
    Upon careful review of the itemized statement and comparison with standardized government pricing guidelines (such as CGHS and NPPA benchmarks), 
    it appears that several line items significantly exceed reasonable and customary rates.<br/><br/>
    Below is a detailed breakdown of the specific charges in question, the amounts billed, and the corresponding maximum benchmark rates:
    """
    elements.append(Paragraph(preamble, styles['Justify']))
    elements.append(Spacer(1, 0.25 * inch))
    
    # Table Data
    table_data = [['Description', 'Billed (₹)', 'Gov Limit (₹)', 'Excess (₹)']]
    total_excess = 0
    
    for item in flagged_items:
        billed = item.total_price or 0
        limit = item.benchmark_max or 0
        excess = max(0, billed - limit) if limit else 0
        total_excess += excess
        
        table_data.append([
            Paragraph(item.raw_description, styles['Normal']),
            f"{billed:,.2f}",
            f"{limit:,.2f}" if limit else "N/A",
            f"{excess:,.2f}" if excess else "Review"
        ])
        
    table_data.append(['TOTAL ESTIMATED OVERCHARGE', '', '', f"₹{total_excess:,.2f}"])

    # Create Table
    col_widths = [3 * inch, 1 * inch, 1 * inch, 1 * inch]
    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.HexColor("#f8fafc")),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -2), 1, colors.HexColor("#cbd5e1")),
        # Total Row Styling
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
        ('ALIGN', (0, -1), (0, -1), 'LEFT'),
    ]))
    
    elements.append(t)
    elements.append(Spacer(1, 0.25 * inch))
    
    # Conclusion
    conclusion = f"""
    Based on this analysis, I am formally requesting a review of these charges and an adjustment of the invoice 
    to reflect fair, customary, and compliant pricing. Please place a hold on my account regarding these specific 
    disputed amounts while this matter is investigated.<br/><br/>
    I expect a written, itemized response addressing these exact discrepancies within 30 days. Should this not be 
    resolved satisfactorily, I reserve the right to escalate this matter to the relevant healthcare regulatory 
    authorities and consumer protection bodies.<br/><br/>
    Thank you for your prompt attention to this matter.
    """
    elements.append(Paragraph(conclusion, styles['Justify']))
    elements.append(Spacer(1, 0.5 * inch))
    
    # Sign-off
    elements.append(Paragraph("Sincerely,", styles['Normal']))
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(Paragraph(f"<b>{sender_name}</b>", styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
