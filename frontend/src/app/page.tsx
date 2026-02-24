"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Animated Counter Component ─── */
function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out curve
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─── Navigation ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled
          ? "glass-panel !rounded-none !border-t-0 !border-l-0 !border-r-0"
          : "bg-transparent"
        }`}
      style={{ transitionDuration: "var(--duration-macro)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-emerald), #059669)",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12l2 2 4-4" />
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
          </div>
          <span className="text-section-title" style={{ color: "var(--text-primary)" }}>
            BillSentry
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-data-label hover:text-[var(--text-primary)] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-data-label hover:text-[var(--text-primary)] transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-data-label hover:text-[var(--text-primary)] transition-colors">
            Pricing
          </a>
          <a href="#trust" className="text-data-label hover:text-[var(--text-primary)] transition-colors">
            Security
          </a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm hidden sm:block">
            Sign In
          </button>
          <button className="btn-primary text-sm">Upload Bill</button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Gradient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[128px] opacity-20"
        style={{ background: "var(--accent-emerald)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[128px] opacity-10"
        style={{ background: "var(--accent-amber)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Micro-badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in-up"
          style={{
            background: "var(--accent-emerald-glow)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            animationDelay: "0.1s",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)] animate-pulse" />
          <span className="text-micro !text-[var(--accent-emerald)]">
            India&apos;s First Healthcare Billing Intelligence Platform
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-display mb-6 animate-fade-in-up"
          style={{
            animationDelay: "0.2s",
            background: "linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Hospital bills shouldn&apos;t
          <br />
          be a mystery.
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg max-w-2xl mx-auto mb-10 animate-fade-in-up"
          style={{
            color: "var(--text-secondary)",
            animationDelay: "0.35s",
            lineHeight: 1.7,
          }}
        >
          Upload your private hospital bill. We benchmark every line item
          against CGHS, PMJAY &amp; NPPA public rates and generate a structured
          discrepancy report — so you can question with confidence.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <button className="btn-primary text-base px-8 py-4 animate-pulse-glow">
            Upload Your Bill →
          </button>
          <button className="btn-secondary text-base px-8 py-4">
            See How It Works
          </button>
        </div>

        {/* Stats bar */}
        <div
          className="glass-panel p-6 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up"
          style={{ animationDelay: "0.65s" }}
        >
          {[
            { value: 94, suffix: "%", label: "Avg Confidence Score" },
            { value: 47, suffix: "%", label: "Avg Overcharge Detected" },
            { value: 1200, suffix: "+", label: "Bills Analyzed" },
            { value: 3, suffix: " Databases", label: "Benchmark Sources" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-metric" style={{ color: "var(--accent-emerald)" }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-data-label mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features Section ─── */
function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      title: "Smart Bill Parsing",
      description:
        "OCR-powered extraction categorizes every line item—procedures, medicines, consumables, ICU charges—into structured data.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      title: "Benchmark Engine",
      description:
        "Every charge is compared against CGHS procedure rates, PMJAY packages, and NPPA drug ceiling prices in real-time.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "Discrepancy Detection",
      description:
        "Flags overcharges, duplicate entries, suspicious 'miscellaneous' lumps, and fragmented package procedures automatically.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      title: "Dispute Letter Generator",
      description:
        "Auto-generates professional, reference-backed letters to hospitals, insurers, or consumer courts. Advisory, not accusatory.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: "Confidence Scoring",
      description:
        "Every analysis includes an AI confidence score showing how reliably each line item was matched and benchmarked.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: "Enterprise-Grade Security",
      description:
        "AES-256 encryption, DPDP Act 2023 compliance, data localization in AWS Mumbai, and zero-trust architecture throughout.",
    },
  ];

  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-micro mb-3" style={{ color: "var(--accent-emerald)" }}>
            Platform Capabilities
          </p>
          <h2 className="text-display !text-[36px] mb-4">
            Financial intelligence,
            <br />
            not guesswork.
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Every module is engineered to transform opaque hospital charges into
            transparent, actionable insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={i}
              className="glass-panel p-8 group cursor-default"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110"
                style={{
                  background: "var(--accent-emerald-glow)",
                  color: "var(--accent-emerald)",
                  transitionDuration: "var(--duration-micro)",
                }}
              >
                {feat.icon}
              </div>
              <h3 className="text-section-title mb-3">{feat.title}</h3>
              <p className="text-tabular" style={{ color: "var(--text-secondary)" }}>
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works Section ─── */
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Bill",
      description: "Upload your hospital bill as a PDF. We support digital PDFs from all major private hospitals.",
    },
    {
      number: "02",
      title: "AI Extracts & Categorizes",
      description: "Our OCR and NLP engine extracts every line item and classifies it — procedures, medicines, diagnostics, room charges.",
    },
    {
      number: "03",
      title: "Benchmark Comparison",
      description: "Each item is compared against CGHS rates, PMJAY packages, and NPPA drug ceiling prices for your region.",
    },
    {
      number: "04",
      title: "Get Your Report",
      description: "Receive a structured discrepancy report with variance percentages, confidence scores, and optional dispute letters.",
    },
  ];

  return (
    <section id="how-it-works" className="py-32 px-6" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-micro mb-3" style={{ color: "var(--accent-amber)" }}>
            Process
          </p>
          <h2 className="text-display !text-[36px] mb-4">
            From chaos to clarity
            <br />
            in four steps.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="glass-panel p-8 flex gap-6">
              <div
                className="text-metric shrink-0"
                style={{
                  color: i < 2 ? "var(--accent-emerald)" : "var(--accent-amber)",
                  opacity: 0.6,
                }}
              >
                {step.number}
              </div>
              <div>
                <h3 className="text-section-title mb-2">{step.title}</h3>
                <p className="text-tabular" style={{ color: "var(--text-secondary)" }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Section ─── */
function PricingSection() {
  const plans = [
    {
      name: "Basic Analysis",
      price: "₹499",
      description: "Quick bill scan with benchmark comparison",
      features: [
        "PDF bill upload & OCR parsing",
        "Line-item categorization",
        "CGHS benchmark comparison",
        "Summary discrepancy report",
        "Confidence score",
      ],
      accent: false,
    },
    {
      name: "Advanced Audit",
      price: "₹999",
      description: "Full audit with detailed variance analysis",
      features: [
        "Everything in Basic",
        "Multi-database benchmarking (CGHS + PMJAY + NPPA)",
        "Duplicate charge detection",
        "Suspicious category flagging",
        "Downloadable PDF report",
      ],
      accent: true,
    },
    {
      name: "Dispute Package",
      price: "₹1,999",
      description: "Complete audit + professional dispute documentation",
      features: [
        "Everything in Advanced",
        "Auto-generated dispute letter",
        "Hospital / Insurer / Court templates",
        "Reference-backed argumentation",
        "Editable DOC + PDF output",
      ],
      accent: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-micro mb-3" style={{ color: "var(--accent-emerald)" }}>
            Pricing
          </p>
          <h2 className="text-display !text-[36px] mb-4">
            Transparent pricing.
            <br />
            No hidden fees.
          </h2>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Pay per audit. No subscriptions required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`glass-panel p-8 flex flex-col ${plan.accent ? "!border-[var(--accent-emerald)]" : ""
                }`}
              style={
                plan.accent
                  ? {
                    boxShadow:
                      "0 10px 40px rgba(0,0,0,0.25), 0 0 40px rgba(16,185,129,0.1)",
                  }
                  : {}
              }
            >
              {plan.accent && (
                <div className="badge-success self-start mb-4">Most Popular</div>
              )}
              <h3 className="text-section-title mb-1">{plan.name}</h3>
              <p className="text-data-label mb-6">{plan.description}</p>
              <div className="text-metric mb-8" style={{ color: "var(--text-primary)" }}>
                {plan.price}
                <span className="text-data-label ml-2">/ audit</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex gap-3 text-tabular" style={{ color: "var(--text-secondary)" }}>
                    <svg
                      className="shrink-0 mt-0.5"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent-emerald)"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                className={plan.accent ? "btn-primary w-full" : "btn-secondary w-full"}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Trust / Security Section ─── */
function TrustSection() {
  const badges = [
    { label: "AES-256", sublabel: "Encryption at Rest" },
    { label: "TLS 1.3", sublabel: "In-Transit Security" },
    { label: "DPDP Act", sublabel: "2023 Compliant" },
    { label: "AWS Mumbai", sublabel: "Data Residency" },
  ];

  return (
    <section id="trust" className="py-32 px-6" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-micro mb-3" style={{ color: "var(--accent-amber)" }}>
          Enterprise-Grade Security
        </p>
        <h2 className="text-display !text-[36px] mb-4">
          Your data. Your control.
        </h2>
        <p
          className="text-lg max-w-2xl mx-auto mb-16"
          style={{ color: "var(--text-secondary)" }}
        >
          Built from the ground up with zero-trust architecture, strict data
          localization within India, and end-to-end encryption.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="glass-panel p-6">
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: "var(--accent-amber-glow)",
                  color: "var(--accent-amber)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="text-section-title !text-[16px] mb-1">{badge.label}</div>
              <div className="text-data-label">{badge.sublabel}</div>
            </div>
          ))}
        </div>

        <p className="text-micro mt-12" style={{ color: "var(--text-muted)" }}>
          This platform provides advisory analysis based on publicly available
          benchmark data. It does not constitute legal or medical advice.
        </p>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function CTASection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--accent-emerald) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-display !text-[40px] mb-6">
          Ready to understand
          <br />
          your hospital bill?
        </h2>
        <p
          className="text-lg mb-10"
          style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
        >
          Upload your bill now and get an instant benchmark analysis. No
          sign-up required for the first scan.
        </p>
        <button className="btn-primary text-lg px-10 py-5 animate-pulse-glow">
          Upload Your Bill — It&apos;s Quick →
        </button>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer
      className="py-12 px-6"
      style={{
        borderTop: "1px solid var(--border-glass)",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent-emerald), #059669)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 12l2 2 4-4" />
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
          </div>
          <span className="text-section-title !text-[16px]">BillSentry Health</span>
        </div>

        <p className="text-micro" style={{ color: "var(--text-muted)" }}>
          © 2026 BillSentry Health. Advisory analytics tool. Not legal or medical advice.
        </p>

        <div className="flex gap-6">
          <a href="#" className="text-data-label hover:text-[var(--text-primary)] transition-colors">
            Privacy
          </a>
          <a href="#" className="text-data-label hover:text-[var(--text-primary)] transition-colors">
            Terms
          </a>
          <a href="#" className="text-data-label hover:text-[var(--text-primary)] transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TrustSection />
      <CTASection />
      <Footer />
    </main>
  );
}
