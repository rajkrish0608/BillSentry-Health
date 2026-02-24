"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import CinematicHero from "@/components/landing/CinematicHero";

/* ═══════════════════════════════════════════════════
   Animated Number Counter with psychological pause
   ═══════════════════════════════════════════════════ */
function Counter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   Section Wrapper with Framer Motion fade-in
   ═══════════════════════════════════════════════════ */
function AnimatedSection({
  children,
  className = "",
  style = {},
  id,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.17, 0.67, 0.83, 0.67] }}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════
   Navbar
   ═══════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
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
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent-emerald), #059669)",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4" />
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
          </div>
          <span className="text-section-title" style={{ color: "var(--text-primary)" }}>
            BillSentry
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Pricing", "Security"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-data-label hover:text-[var(--text-primary)] transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm hidden sm:block">Sign In</button>
          <button className="btn-primary text-sm">Upload Bill</button>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════
   Stats Bar (after hero)
   ═══════════════════════════════════════════════════ */
function StatsBar() {
  const stats = [
    { value: 94, suffix: "%", label: "Avg Confidence Score" },
    { value: 47, suffix: "%", label: "Avg Overcharge Detected" },
    { value: 1200, suffix: "+", label: "Bills Analyzed" },
    { value: 3, suffix: "", label: "Benchmark Databases" },
  ];

  return (
    <AnimatedSection className="relative z-10 -mt-20 px-6 mb-16">
      <div className="glass-panel p-8 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-metric" style={{ color: "var(--accent-emerald)" }}>
              <Counter target={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-data-label mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}

/* ═══════════════════════════════════════════════════
   Features Section
   ═══════════════════════════════════════════════════ */
function Features() {
  const features = [
    {
      icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      title: "Smart Bill Parsing",
      desc: "OCR-powered extraction categorizes every line item into structured data automatically.",
    },
    {
      icon: "M18 20V10M12 20V4M6 20v-6",
      title: "Benchmark Engine",
      desc: "Every charge compared against CGHS, PMJAY, and NPPA databases in real-time.",
    },
    {
      icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
      title: "Discrepancy Detection",
      desc: "Flags overcharges, duplicates, suspicious lumps, and fragmented packages.",
    },
    {
      icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
      title: "Dispute Letters",
      desc: "Auto-generated letters to hospitals, insurers, or consumer courts. Advisory, not accusatory.",
    },
    {
      icon: "M12 2a10 10 0 1 0 10 10M12 6v6l4 2",
      title: "Confidence Scoring",
      desc: "AI confidence score showing reliability of each benchmarked line item.",
    },
    {
      icon: "M3 11h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM7 11V7a5 5 0 0 1 10 0v4",
      title: "Enterprise Security",
      desc: "AES-256 encryption, DPDP Act 2023, data localization in AWS Mumbai.",
    },
  ];

  return (
    <AnimatedSection id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-micro mb-3" style={{ color: "var(--accent-emerald)" }}>
            Platform Capabilities
          </p>
          <h2 className="text-display !text-[36px] mb-4">
            Financial intelligence, not guesswork.
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Every module is engineered to transform opaque hospital charges into transparent, actionable insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              className="glass-panel p-8 group cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.17, 0.67, 0.83, 0.67],
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{
                  background: "var(--accent-emerald-glow)",
                  color: "var(--accent-emerald)",
                  transitionDuration: "var(--duration-micro)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={feat.icon} />
                </svg>
              </div>
              <h3 className="text-section-title mb-3">{feat.title}</h3>
              <p className="text-tabular" style={{ color: "var(--text-secondary)" }}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ═══════════════════════════════════════════════════
   How It Works
   ═══════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { num: "01", title: "Upload Your Bill", desc: "Upload your hospital bill as a PDF. We support digital PDFs from all major private hospitals." },
    { num: "02", title: "AI Extracts & Categorizes", desc: "OCR and NLP engine extracts every line item and classifies it — procedures, medicines, diagnostics, room charges." },
    { num: "03", title: "Benchmark Comparison", desc: "Each item benchmarked against CGHS, PMJAY, and NPPA public databases for your region." },
    { num: "04", title: "Get Your Report", desc: "Structured discrepancy report with variance percentages, confidence scores, and optional dispute letters." },
  ];

  return (
    <AnimatedSection
      id="how-it-works"
      className="py-32 px-6"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-micro mb-3" style={{ color: "var(--accent-amber)" }}>Process</p>
          <h2 className="text-display !text-[36px] mb-4">From chaos to clarity in four steps.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="glass-panel p-8 flex gap-6"
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.17, 0.67, 0.83, 0.67] }}
            >
              <div className="text-metric shrink-0" style={{ color: i < 2 ? "var(--accent-emerald)" : "var(--accent-amber)", opacity: 0.6 }}>
                {step.num}
              </div>
              <div>
                <h3 className="text-section-title mb-2">{step.title}</h3>
                <p className="text-tabular" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ═══════════════════════════════════════════════════
   Pricing
   ═══════════════════════════════════════════════════ */
function Pricing() {
  const plans = [
    {
      name: "Basic Analysis", price: "₹499", desc: "Quick scan with benchmark comparison", accent: false,
      features: ["PDF bill upload & OCR", "Line-item categorization", "CGHS benchmark comparison", "Summary report", "Confidence score"],
    },
    {
      name: "Advanced Audit", price: "₹999", desc: "Full audit with detailed variance analysis", accent: true,
      features: ["Everything in Basic", "Multi-database benchmarking", "Duplicate detection", "Suspicious category flagging", "Downloadable PDF report"],
    },
    {
      name: "Dispute Package", price: "₹1,999", desc: "Complete audit + dispute documentation", accent: false,
      features: ["Everything in Advanced", "Auto-generated dispute letter", "Hospital / Insurer / Court templates", "Reference-backed argumentation", "Editable DOC + PDF"],
    },
  ];

  return (
    <AnimatedSection id="pricing" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-micro mb-3" style={{ color: "var(--accent-emerald)" }}>Pricing</p>
          <h2 className="text-display !text-[36px] mb-4">Transparent pricing. No hidden fees.</h2>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>Pay per audit. No subscriptions required.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`glass-panel p-8 flex flex-col ${plan.accent ? "!border-[var(--accent-emerald)]" : ""}`}
              style={plan.accent ? { boxShadow: "0 10px 40px rgba(0,0,0,0.25), 0 0 40px rgba(16,185,129,0.1)" } : {}}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.17, 0.67, 0.83, 0.67] }}
            >
              {plan.accent && <div className="badge-success self-start mb-4">Most Popular</div>}
              <h3 className="text-section-title mb-1">{plan.name}</h3>
              <p className="text-data-label mb-6">{plan.desc}</p>
              <div className="text-metric mb-8">{plan.price}<span className="text-data-label ml-2">/ audit</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex gap-3 text-tabular" style={{ color: "var(--text-secondary)" }}>
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={plan.accent ? "btn-primary w-full" : "btn-secondary w-full"}>Get Started</button>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ═══════════════════════════════════════════════════
   Security / Trust
   ═══════════════════════════════════════════════════ */
function Trust() {
  const badges = [
    { label: "AES-256", sub: "Encryption at Rest" },
    { label: "TLS 1.3", sub: "In-Transit Security" },
    { label: "DPDP Act", sub: "2023 Compliant" },
    { label: "AWS Mumbai", sub: "Data Residency" },
  ];

  return (
    <AnimatedSection id="security" className="py-32 px-6" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-micro mb-3" style={{ color: "var(--accent-amber)" }}>Enterprise-Grade Security</p>
        <h2 className="text-display !text-[36px] mb-4">Your data. Your control.</h2>
        <p className="text-lg max-w-2xl mx-auto mb-16" style={{ color: "var(--text-secondary)" }}>
          Built with zero-trust architecture, strict data localization within India, and end-to-end encryption.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((b, i) => (
            <motion.div
              key={i}
              className="glass-panel p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--accent-amber-glow)", color: "var(--accent-amber)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="text-section-title !text-[16px] mb-1">{b.label}</div>
              <div className="text-data-label">{b.sub}</div>
            </motion.div>
          ))}
        </div>
        <p className="text-micro mt-12" style={{ color: "var(--text-muted)" }}>Advisory analysis only. Not legal or medical advice.</p>
      </div>
    </AnimatedSection>
  );
}

/* ═══════════════════════════════════════════════════
   CTA
   ═══════════════════════════════════════════════════ */
function CTA() {
  return (
    <AnimatedSection className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(ellipse at center, var(--accent-emerald) 0%, transparent 70%)" }} />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-display !text-[40px] mb-6">Ready to understand your hospital bill?</h2>
        <p className="text-lg mb-10" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Upload your bill now and get an instant benchmark analysis.
        </p>
        <button className="btn-primary text-lg px-10 py-5 animate-pulse-glow">Upload Your Bill →</button>
      </div>
    </AnimatedSection>
  );
}

/* ═══════════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="py-12 px-6" style={{ borderTop: "1px solid var(--border-glass)" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--accent-emerald), #059669)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 12l2 2 4-4" /><path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
          </div>
          <span className="text-section-title !text-[16px]">BillSentry Health</span>
        </div>
        <p className="text-micro" style={{ color: "var(--text-muted)" }}>© 2026 BillSentry Health. Advisory analytics tool.</p>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a key={link} href="#" className="text-data-label hover:text-[var(--text-primary)] transition-colors">{link}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   Page Assembly
   ═══════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main>
      <Navbar />
      <CinematicHero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Pricing />
      <Trust />
      <CTA />
      <Footer />
    </main>
  );
}
