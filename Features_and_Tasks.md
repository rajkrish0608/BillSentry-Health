# BillSentry Health - Features and Task List

Based on the analysis of the PRD, TRD, Design, and Concept Documents, here is the comprehensive feature and task to-do list for building the BillSentry Health MVP.

## 1. Project Setup & Foundational Architecture
**Features:**
- Full-stack repository setup.
- Containerized development environment.
- Cloud architecture provisioning.

**Tasks:**
- [ ] Initialize Next.js (App Router) project with TypeScript and Tailwind CSS.
- [ ] Setup Python FastAPI backend environment.
- [ ] Configure PostgreSQL database and optionally Redis for caching.
- [ ] Provision AWS infrastructure (S3 bucket for uploads, KMS for AES-256 encryption in ap-south-1).
- [ ] Setup unified API Gateway and define RESTful endpoints for MVP.

## 2. Frontend & UI/UX Engineering
**Features:**
- High-trust, FinTech-inspired design system.
- 3D WebGL cinematic hero section.
- Premium glassmorphism dashboard UI.
- Accessible, dark-mode default interface.

**Tasks:**
- [ ] Configure Tailwind CSS with precise design tokens (Deep Navy #0F172A, Emerald #10B981, Amber #F59E0B, Silver-Gray #94A3B8).
- [ ] Import and set up the dual-typeface system (Satoshi for display, Inter for data).
- [ ] Build the 3D WebGL cinematic storytelling landing page using React Three Fiber, Three.js, and GSAP.
- [ ] Develop reusable soft-glassmorphism components (Cards, Modals) using deep background blurs and precise drop-shadows.
- [ ] Implement custom cubic-bezier animations for micro-interactions (hovers, loaders, dashboard transitions) using Framer Motion and Anime.js.
- [ ] Build the "Confidence Meter" with timed counting animations.

## 3. Authentication & Security (HIPAA & DPDP Act Compliant)
**Features:**
- Secure User Registration & Login.
- Role-based Access Control.
- Data privacy & security transparency.

**Tasks:**
- [ ] Integrate authentication provider (Clerk, Auth0, or custom JWT with Email/OTP).
- [ ] Build the "Security Trust Page" highlighting encryption badges and a GSAP-animated zero-trust architecture diagram.
- [ ] Implement explicit data processing consent components on the upload UI.
- [ ] Setup API rate limiting and HTTPS enforcement.

## 4. Bill Upload & OCR Pipeline
**Features:**
- Secure PDF/Image file ingestion.
- High-accuracy text extraction from tabular hospital bills.
- User interface for manual OCR correction.

**Tasks:**
- [ ] Develop secure file upload component on the frontend sending files to AWS S3.
- [ ] Integrate OCR Engine (Google Vision API or AWS Textract) to process S3 objects.
- [ ] Implement fallback OCR (Tesseract / pdfminer) for text-based PDFs.
- [ ] Create a manual review/correction UI for bills with OCR confidence below 80%.

## 5. NLP Parsing & Categorization Engine
**Features:**
- Structured line-item extraction from raw text.
- Medical category classification.

**Tasks:**
- [ ] Develop regex heuristics to isolate descriptions, quantities, unit prices, and total prices from raw OCR tables.
- [ ] Build a categorization rules engine classifying items into standard buckets (Procedure, Room, ICU, Diagnostics, Medicines, etc.).
- [ ] Implement fuzzy string matching (RapidFuzz) and TF-IDF similarity to map messy descriptions to known codes.

## 6. Benchmark & Pricing Valuation
**Features:**
- Standardized rate lookup based on public data.
- Algorithmic variance calculation.
- Anomaly & duplicate charge detection.

**Tasks:**
- [ ] Build automated/manual importers for CGHS rate lists, PMJAY packages, and NPPA drug ceilings into PostgreSQL.
- [ ] Develop the Discrepancy Engine to compare extracted line items against benchmark prices.
- [ ] Implement variance tagging thresholds (e.g., 20% = Elevated, 40% = High variance).
- [ ] Create the suspicious category detector (flagging excessive "Miscellaneous" or "Procedure Kit" charges).
- [ ] Build the duplicate detection algorithm (using cosine similarity on descriptions and prices).

## 7. Reporting & Analytics Dashboard
**Features:**
- Interactive data tables for bill breakdown.
- Aggregated financial risk summaries.
- Exportable structured reports.

**Tasks:**
- [ ] Build frontend data data grids to display line items, status flags, and benchmark comparisons.
- [ ] Integrate ECharts / Recharts for animated horizontal variance bars and risk score radial indicators.
- [ ] Prompt an LLM (OpenAI/Claude) with the structured discrepancy data to generate a plain-language summary.
- [ ] Generate the final PDF Audit Report using WeasyPrint or a Puppeteer service.

## 8. Dispute Letter Generation & Payments
**Features:**
- Auto-generated dispute communication.
- Monetization layer for premium features.

**Tasks:**
- [ ] Create Jinja2 templates to compile structured dispute letters pointing out benchmark deviations.
- [ ] Build endpoints for generating downloadable DOC/PDF versions of the dispute letter.
- [ ] Integrate Razorpay/Stripe (India) to process payments (₹499/₹999/₹1,999 packages) before unlocking full reports or letters.
- [ ] Setup webhook listeners to handle successful transaction state changes.
