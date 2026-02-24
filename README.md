<div align="center">
  <img src="frontend/public/vite.svg" alt="BillSentry Logo" width="120" />
  <h1>BillSentry Health</h1>
  <p><strong>Healthcare Billing Intelligence Platform</strong></p>
  <p>Understand your hospital bill before you pay. Upload, instantly benchmark against government rates (CGHS/PMJAY/NPPA), and generate professional dispute documents.</p>

  <div>
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
    <img src="https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay" />
  </div>
</div>

---

## 🚀 Features

- **AI-Powered OCR**: Instantly extract raw line items from scanned PDF, JPG, or PNG hospital bills using `pdfminer` and `pytesseract`.
- **Fuzzy Benchmark Matching**: Cross-reference hospital charges against Indian government pricing catalogs (CGHS, PMJAY, NPPA) using regex and fuzzy string matching.
- **Visual Audit Dashboard**: Beautiful frontend showcasing risk metrics, identified overcharges, and potential recovery amounts.
- **Automated Legal Dispute Letters**: One-click generation of formalized PDF demand letters citing the Consumer Protection Act and specific price benchmarks (via `reportlab`).
- **Razorpay Integration**: Premium payment gatekeeping for dispute letter generation.
- **Advisor Network**: Seamless marketplace connecting users with Consumer Court Lawyers and Medical Auditors to escalate heavy overcharging cases.
- **Admin Infrastructure**: Built-in CSV un-loader and manager for benchmarking rules.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, Zustand (Auth state). Built as a Progressive Web App (PWA) with responsive Glassmorphism design.
- **Backend**: FastAPI (Python), SQLAlchemy ORM, SQLite (local dev), PyJWT for Authentication.
- **Intelligence Core**: Tesseract OCR, FuzzyWuzzy matching, ReportLab PDF generation.

## 🛠️ Local Development Setup

### 1. Backend Setup

You will need Python 3.10+ and Tesseract OCR installed on your system.

```bash
# MacOS/Homebrew
brew install tesseract

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
# Open .env and add your Razorpay Test Keys and set SECRET_KEY

# Start Backend Server
uvicorn app.main:app --reload --port 8000
```
*The backend API will be running at `http://localhost:8000`. Access Swagger UI at `http://localhost:8000/docs`.*

### 2. Frontend Setup

You will need Node.js 18+ installed.

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js Development Server
npm run dev
```
*The web app will be accessible at `http://localhost:3000`.*

## 🔒 Security & PWA
- **Security Headers**: The backend API ships with strict Cross-Origin bounds, HSTS, and X-Frame-Options blocking via Starlette middleware.
- **PWA Ready**: Mobile users can "Add to Home Screen" locally for an app-like experience using the included `manifest.json`.

## 📜 License
This project is proprietary and confidential. Unauthorized copying of this repository, via any medium, is strictly prohibited.
