```
██████╗ ██╗██╗     ██╗     ███████╗███████╗███╗   ██╗████████╗██████╗ ██╗   ██╗
██╔══██╗██║██║     ██║     ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██╔══██╗╚██╗ ██╔╝
██████╔╝██║██║     ██║     ███████╗█████╗  ██╔██╗ ██║   ██║   ██████╔╝ ╚████╔╝
██╔══██╗██║██║     ██║     ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██╔══██╗  ╚██╔╝
██████╔╝██║███████╗███████╗███████║███████╗██║ ╚████║   ██║   ██║  ██║   ██║
╚═════╝ ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝
                                                                  H E A L T H
```

<div align="center">

# BillSentry Health

**Healthcare Billing Intelligence Platform**

*Structured benchmark analysis of private hospital bills against public pricing databases.*

---

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![AWS](https://img.shields.io/badge/AWS-ap--south--1-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![License](https://img.shields.io/badge/License-MIT-slate?style=flat-square)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-10B981?style=flat-square)]()
[![DPDP](https://img.shields.io/badge/DPDP%20Act-2023%20Compliant-3B82F6?style=flat-square)]()

</div>

---

## Overview

Private hospital bills in India are non-standardized, dense with ambiguous line items, and almost universally processed under financial and emotional duress. Publicly available benchmark data — CGHS procedure rates, PMJAY package tariffs, and NPPA drug ceiling prices — exists but remains fragmented and inaccessible to the patients who need it.

**BillSentry Health** is a cloud-based, API-first SaaS platform that automates the analysis of private hospital bills against these public pricing databases. It extracts structured line items via OCR, categorizes charges using NLP and rules-based engines, benchmarks each item against authoritative government rate cards, flags statistically significant variances, and generates structured audit reports with optional dispute documentation.

> **Advisory Positioning:** BillSentry Health is an analytical intelligence tool, not a legal enforcement platform. All output is labelled as benchmark comparison data derived from publicly available sources and carries a mandatory advisory disclaimer. The platform does not name, rank, or accuse individual hospitals of fraud.

---

## System Architecture

```mermaid
graph TD
    A[User / Browser] -->|HTTPS| B[Next.js Frontend]
    B -->|REST API| C[API Gateway — FastAPI]

    C --> D[Authentication Service\nJWT / Clerk / Auth0]
    C --> E[Bill Processing Service]
    C --> F[Payment Service\nRazorpay / Stripe]

    E --> G[OCR Engine\nAWS Textract / Google Vision]
    E --> H[Line Item Parser\nRegex + Heuristics]
    E --> I[Categorization Engine\nTF-IDF + RapidFuzz + spaCy]
    E --> J[Benchmark Engine\nCGHS / PMJAY / NPPA]
    E --> K[Report Generator\nWeasyPrint / Puppeteer]
    E --> L[Dispute Letter Generator\nJinja2 Templates]

    C -->|Read / Write| M[(PostgreSQL\nPrimary Database)]
    C -->|Cache| N[(Redis\nBenchmark Cache)]
    G -->|Raw Files| O[AWS S3\nPrivate Bucket — AES-256]
    K -->|Generated Reports| O

    style A fill:#1E293B,stroke:#334155,color:#E2E8F0
    style B fill:#1E293B,stroke:#334155,color:#E2E8F0
    style C fill:#0F172A,stroke:#10B981,color:#E2E8F0
    style M fill:#1E293B,stroke:#3B82F6,color:#E2E8F0
    style N fill:#1E293B,stroke:#F59E0B,color:#E2E8F0
    style O fill:#1E293B,stroke:#F59E0B,color:#E2E8F0
```

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| 🖥 **Frontend** | Next.js 16, TypeScript, Tailwind CSS | App Router, SSR/SSG |
| ⚙️ **Backend** | Python 3.11, FastAPI, Uvicorn | Async, Pydantic v2 |
| 🤖 **AI / NLP** | spaCy, scikit-learn (TF-IDF), RapidFuzz | Phase 1: rules-based; Phase 2: fine-tuned model |
| 📄 **OCR** | AWS Textract (primary), Google Vision API, Tesseract (fallback) | Confidence threshold: 80% |
| 🗄 **Database** | PostgreSQL 16 | ACID-compliant; Alembic migrations |
| ⚡️ **Cache** | Redis | Benchmark lookup acceleration |
| ☁️ **Cloud** | AWS (`ap-south-1`) | S3, KMS, CloudTrail, ECS |
| 🔐 **Auth** | Clerk / Auth0 / JWT | RBAC, MFA, SSO ready |
| 💳 **Payments** | Razorpay, Stripe India | Webhook-based unlock flow |
| 📊 **Charting** | Apache ECharts, Recharts | Variance bars, risk radials |
| 🎨 **Animation** | Framer Motion, Anime.js, GSAP | 120–300ms precision curves |
| 📑 **PDF Generation** | WeasyPrint / Puppeteer | Structured audit reports |
| 📬 **Letter Templates** | Jinja2 | Hospital / Insurer / Court targets |
| 🔍 **Monitoring** | Sentry, Prometheus, Grafana | Error tracking + APM |

---

## Features

### Core

- **Bill Ingestion** — PDF and image upload (max 15 MB). Supports standard digital bills from private hospitals.
- **OCR Extraction** — Structured extraction of description, quantity, unit price, and total per line item. Manual correction UI for low-confidence regions.
- **Line Item Categorization** — Automatic classification into: Procedure, Room, ICU, Diagnostics, Medicines, Consumables, Professional Fees, Miscellaneous.
- **Benchmark Comparison** — Per-item lookup against CGHS, PMJAY, and NPPA databases. Variance calculated as `((Hospital Price − Benchmark) / Benchmark) × 100`.
- **Variance Flagging** — Threshold-based tagging: 20% = Elevated · 40% = High · 60% = Significant.
- **Duplicate Detection** — Cosine similarity (> 0.9) across description strings and price ranges.
- **Suspicious Category Detector** — Flags vague entries (Miscellaneous, Procedure Kit, Administrative Fees) exceeding 10% of total bill without itemization.
- **Confidence Scoring** — Per-report AI confidence score reflecting match quality across benchmarked items.
- **Downloadable Audit Report** — Structured PDF with: Executive Summary · Item-Level Analysis · Benchmark References · Advisory Notes · Legal Disclaimer.

### Premium

- **Dispute Letter Generator** — Auto-generated letters referencing specific benchmark deviations. Targets: Hospital Billing Department, Insurance Company, Consumer Court.
- **Editable Output** — DOC + PDF output via Jinja2 templates with custom patient and hospital fields.
- **Multi-target Letters** — Separate templates per dispute target with appropriate legal language.

### Security & Compliance

- End-to-end AES-256 encryption at rest (AWS KMS) and TLS 1.3 in transit.
- DPDP Act 2023 compliant: data localization in `ap-south-1`, explicit consent capture, right to erasure.
- HIPAA-aligned safeguards via AWS Business Associate Agreements.
- Zero-trust API architecture: stateless JWT verification, rate limiting, audit logging via CloudTrail.
- Temporary raw file storage: auto-deleted after 30 days via S3 lifecycle policy.

---

## Data Flow

```
1. Upload
   └── User uploads PDF/Image via frontend
   └── File validated (type, size ≤ 15 MB)
   └── Stored in private S3 bucket (AES-256)
   └── HospitalBill record created — status: UPLOADED

2. OCR Extraction
   └── Async Celery worker triggered
   └── AWS Textract / Google Vision processes document
   └── pdfminer fallback for text-layer PDFs
   └── Raw text → table detection via column patterns

3. Line Item Parsing
   └── Regex heuristics extract: description, qty, unit_price, total
   └── Fuzzy string cleaning (RapidFuzz)
   └── BillLineItem rows populated with raw_text

4. Categorization
   └── Rule-based keyword mapping (e.g., "ICU BED" → ICU)
   └── TF-IDF similarity for ambiguous items
   └── Unknowns: code=NULL, category=OTHER

5. Benchmark Comparison
   └── PriceRule lookup by normalized_code + region
   └── expected_min = benchmark_min × quantity
   └── expected_max = benchmark_max × quantity
   └── Compare total_price vs. expected range

6. Variance Tagging
   └── flag=OVERCHARGED   if total_price > expected_max × 1.2
   └── flag=OK            if within benchmark range
   └── flag=SUSPICIOUS    for duplicates / vague categories

7. Report Generation
   └── LLM prompted with structured discrepancy data
   └── plain_language_summary cached to AuditReport
   └── PDF rendered via WeasyPrint / Puppeteer
   └── Report URL stored; unlocked on payment confirmation

8. Payment & Unlock
   └── Razorpay/Stripe order created
   └── Webhook validates payment status
   └── Full report + optional dispute letter unlocked
```

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- PostgreSQL 16 (local or Docker)
- Redis (local or Docker)

### Clone & Setup

```bash
git clone https://github.com/your-org/billsentry-health.git
cd billsentry-health
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:3000
```

**Backend**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Fill in your values
uvicorn app.main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

**Database**

```bash
# Using Docker
docker run -d \
  --name billsentry-pg \
  -e POSTGRES_USER=billsentry \
  -e POSTGRES_PASSWORD=billsentry \
  -e POSTGRES_DB=billsentry_db \
  -p 5432:5432 \
  postgres:16

# Alembic migrations (once schema is finalized)
alembic upgrade head
```

### Environment Variables

```env
# Application
APP_NAME=BillSentry Health
DEBUG=True

# Database
DATABASE_URL=postgresql://billsentry:billsentry@localhost:5432/billsentry_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Auth
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET_NAME=billsentry-uploads

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

---

## API Reference

Full interactive documentation available at `/docs` (Swagger UI) and `/redoc` when the backend server is running.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/register` | Register new user | Public |
| `POST` | `/api/v1/auth/login` | Authenticate, receive JWT | Public |
| `GET` | `/api/v1/auth/me` | Get current user profile | Bearer |
| `POST` | `/api/v1/bills/` | Upload hospital bill | Bearer |
| `GET` | `/api/v1/bills/` | List user's bills | Bearer |
| `GET` | `/api/v1/bills/{id}` | Get bill details | Bearer |
| `GET` | `/api/v1/bills/{id}/items` | Get line items with flags | Bearer |
| `GET` | `/api/v1/bills/{id}/audit-report` | Get audit report | Bearer |
| `GET` | `/api/v1/bills/{id}/dispute-letter` | Get dispute letter | Bearer |
| `POST` | `/api/v1/payments/create-order` | Create payment order | Bearer |
| `POST` | `/api/v1/payments/webhook` | Provider webhook | Signed |

---

## Security & Compliance

| Control | Implementation |
|---------|---------------|
| **Encryption at Rest** | AES-256 via AWS KMS on all S3 objects and database volumes |
| **Encryption in Transit** | TLS 1.3 enforced on all endpoints |
| **Authentication** | Stateless JWT with bcrypt password hashing (cost factor 12) |
| **Rate Limiting** | Per-IP and per-user limits on all upload and report endpoints |
| **Data Minimization** | Parser strictly extracts financial data only; clinical notes discarded on ingestion |
| **Consent Capture** | Explicit consent required before bill upload; timestamp + IP logged |
| **Right to Erasure** | Soft-delete + S3 lifecycle purge within 72 hours of user request |
| **Data Residency** | All compute and storage locked to `ap-south-1` (Mumbai); DR in `ap-south-2` (Hyderabad) |
| **Audit Logging** | AWS CloudTrail captures all API calls; immutable for 90 days |
| **DPDP Act 2023** | Compliant as Data Fiduciary: notice, consent, purpose limitation, storage limitation, erasure |

---

## Roadmap

- [x] Project architecture and API scaffold
- [x] Database schema (9-entity ERD)
- [x] Authentication service (JWT)
- [x] Bill upload and file ingestion
- [x] Frontend design system (Dark mode, glassmorphism)
- [x] Landing page with responsive sections
- [ ] OCR pipeline (AWS Textract integration)
- [ ] Line item parser (regex + heuristics)
- [ ] NLP categorization engine
- [ ] Benchmark database seeding (CGHS, PMJAY, NPPA)
- [ ] Discrepancy and duplicate detection engine
- [ ] LLM-generated plain-language summaries
- [ ] PDF audit report generation
- [ ] Dispute letter generator (Jinja2 templates)
- [ ] Razorpay / Stripe payment integration
- [ ] Celery async processing queue
- [ ] Admin dashboard (price rule management)
- [ ] Insurance company API integration (B2B)
- [ ] Claim risk scoring (ML-based anomaly detection)
- [ ] Corporate HR dashboard
- [ ] Multi-language support (Hindi)

---

## Data Sources

| Source | Coverage | Update Cycle |
|--------|----------|--------------|
| [CGHS Rate List](https://cghs.gov.in) | Procedures, diagnostics, room charges | Annual |
| [PMJAY Health Benefit Packages](https://pmjay.gov.in) | Procedure packages (state-wise) | Semi-annual |
| [NPPA Drug Price Ceiling](https://nppa.gov.in) | Scheduled drug price caps | As notified |
| State Rate Cards | Regional rate caps (Haryana, Delhi) | Quarterly |

---

## Contributing

Contributions are welcome. Please follow the process below.

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit with a structured message
git commit -m "feat(benchmark): add NPPA drug importer with state filtering"

# 4. Push and open a Pull Request against main
git push origin feature/your-feature-name
```

**Commit message convention:** `type(scope): description`

Types: `feat` · `fix` · `refactor` · `docs` · `test` · `chore`

All PRs require:
- Clear description of purpose
- At minimum, one reviewer approval
- Passing CI checks

**Security vulnerabilities:** Do not open a public issue. Email `security@billsentry.health` directly.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for full terms.

---

## Disclaimer

BillSentry Health provides advisory analysis based on publicly available government benchmark data. It does not constitute legal or medical advice. Output is clearly labelled as benchmark comparison and should not be used as the sole basis for legal action. The platform does not publish or store hospital names in any publicly accessible form.

---

<div align="center">

Built with precision in India. &nbsp;|&nbsp; AWS `ap-south-1` &nbsp;|&nbsp; DPDP Act 2023 Compliant

</div>
