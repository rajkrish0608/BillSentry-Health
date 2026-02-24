"""
BillSentry Health - OCR Service
Extracts text from uploaded hospital bills (PDF / images).

Strategy:
  1. Text-native PDFs → pdfminer.six (fast, accurate, no OCR needed)
  2. Scanned PDFs / Images → Tesseract OCR via pytesseract + pdf2image
"""

import os
import logging
from typing import Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class OCRResult:
    """Result of text extraction from a bill."""
    raw_text: str
    pages: list[str] = field(default_factory=list)
    confidence: float = 0.0
    method: str = "unknown"
    error: Optional[str] = None


def extract_text(file_path: str) -> OCRResult:
    """
    Main dispatcher: extract text from a bill file.
    Tries pdfminer first (text-native), falls back to Tesseract OCR.
    """
    if not os.path.exists(file_path):
        return OCRResult(raw_text="", error=f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _extract_from_pdf(file_path)
    elif ext in (".jpg", ".jpeg", ".png", ".tiff", ".bmp"):
        return _extract_from_image(file_path)
    elif ext == ".txt":
        # Direct text file — for testing
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        return OCRResult(raw_text=text, pages=[text], confidence=1.0, method="plaintext")
    else:
        return OCRResult(raw_text="", error=f"Unsupported file type: {ext}")


def _extract_from_pdf(file_path: str) -> OCRResult:
    """
    Extract text from PDF. Try text layer first; if empty, OCR the pages.
    """
    # Step 1: Try pdfminer for text-native PDFs
    text = _pdfminer_extract(file_path)
    if text and len(text.strip()) > 50:
        logger.info(f"pdfminer extracted {len(text)} chars from {file_path}")
        return OCRResult(
            raw_text=text,
            pages=[text],
            confidence=0.95,
            method="pdfminer",
        )

    # Step 2: Fall back to Tesseract OCR for scanned PDFs
    logger.info("pdfminer found no text layer, falling back to Tesseract OCR")
    return _tesseract_pdf_extract(file_path)


def _pdfminer_extract(file_path: str) -> str:
    """Extract text from PDF text layer using pdfminer.six."""
    try:
        from pdfminer.high_level import extract_text as pdfminer_extract
        text = pdfminer_extract(file_path)
        return text or ""
    except Exception as e:
        logger.warning(f"pdfminer extraction failed: {e}")
        return ""


def _tesseract_pdf_extract(file_path: str) -> OCRResult:
    """Convert PDF pages to images, then OCR each page with Tesseract."""
    try:
        from pdf2image import convert_from_path
        import pytesseract

        # Configure tesseract path if set
        from app.core.config import settings
        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

        # Convert PDF pages to images (300 DPI for good OCR quality)
        images = convert_from_path(file_path, dpi=300)
        pages = []
        total_confidence = 0.0

        for i, img in enumerate(images):
            # Get text + confidence data
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            page_text = pytesseract.image_to_string(img, lang="eng")
            pages.append(page_text)

            # Calculate average confidence for this page
            confidences = [int(c) for c in data["conf"] if int(c) > 0]
            if confidences:
                total_confidence += sum(confidences) / len(confidences)

        avg_confidence = total_confidence / max(len(pages), 1) / 100.0
        full_text = "\n\n--- PAGE BREAK ---\n\n".join(pages)

        return OCRResult(
            raw_text=full_text,
            pages=pages,
            confidence=round(avg_confidence, 3),
            method="tesseract",
        )

    except ImportError as e:
        logger.error(f"OCR dependencies missing: {e}")
        return OCRResult(
            raw_text="",
            error=f"OCR dependencies missing: {e}. Install pytesseract and pdf2image.",
        )
    except Exception as e:
        logger.error(f"Tesseract OCR failed: {e}")
        return OCRResult(raw_text="", error=f"OCR failed: {e}")


def _extract_from_image(file_path: str) -> OCRResult:
    """Extract text from an image file using Tesseract."""
    try:
        import pytesseract
        from PIL import Image

        from app.core.config import settings
        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

        img = Image.open(file_path)
        text = pytesseract.image_to_string(img, lang="eng")

        # Get confidence
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        confidences = [int(c) for c in data["conf"] if int(c) > 0]
        avg_confidence = (sum(confidences) / len(confidences) / 100.0) if confidences else 0.0

        return OCRResult(
            raw_text=text,
            pages=[text],
            confidence=round(avg_confidence, 3),
            method="tesseract",
        )

    except ImportError as e:
        logger.error(f"OCR dependencies missing: {e}")
        return OCRResult(raw_text="", error=f"Missing dependency: {e}")
    except Exception as e:
        logger.error(f"Image OCR failed: {e}")
        return OCRResult(raw_text="", error=f"OCR failed: {e}")
