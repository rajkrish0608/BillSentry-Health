"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";

const CinematicHero = dynamic(
  () => import("@/components/landing/CinematicHero"),
  { ssr: false }
);

/* ═══════════════════════════════════════════════════
   Reusable: Animated Counter (psychological pause)
   ═══════════════════════════════════════════════════ */
function Counter({
  target,
  prefix = "",
  suffix = "",
  duration = 2000,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out with psychological pause at 90%
      let eased;
      if (progress < 0.8) {
        eased = 1 - Math.pow(1 - progress / 0.8, 3);
        eased *= 0.92;
      } else {
        const slowPhase = (progress - 0.8) / 0.2;
        eased = 0.92 + slowPhase * 0.08;
      }
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   Reusable: Animated Section
   ═══════════════════════════════════════════════════ */
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={
        isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
      }
      transition={{
        duration: 0.7,
        delay,
        ease: [0.17, 0.67, 0.83, 0.67],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   Navbar — blur on scroll, clean design
   ═══════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 transition-all"
      style={{
        background: scrolled
          ? "rgba(15, 23, 42, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid transparent",
        transition: "all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background:
                "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
              color: "#fff",
              boxShadow: "0 2px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            BS
          </div>
          <span
            style={{
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            BillSentry
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Pricing", "Security"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-data-label"
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition:
                    "color var(--duration-micro) var(--ease-premium)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                (e.currentTarget.style.color =
                  "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  "var(--text-secondary)")
                }
              >
                {item}
              </a>
            )
          )}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="hidden sm:inline text-data-label"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            Log in
          </a>
          <button className="btn-primary" style={{ padding: "10px 24px", fontSize: 14 }}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════
   Stats Bar — radial rings + counters
   ═══════════════════════════════════════════════════ */
function StatsBar() {
  const stats = [
    { value: 50000, suffix: "+", label: "Bills Analyzed" },
    { value: 94, suffix: "%", label: "Avg. Confidence Score" },
    { value: 47, suffix: "%", label: "Avg. Variance Found" },
    { value: 12, prefix: "₹", suffix: "Cr+", label: "Savings Identified" },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Subtle separator glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="text-center">
                <div
                  className="text-metric mb-2"
                  style={{
                    fontSize: "clamp(28px, 4vw, 42px)",
                    background:
                      "linear-gradient(180deg, #E2E8F0 0%, #94A3B8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  <Counter
                    target={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="text-data-label">{stat.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   Section Divider — gradient glow line
   ═══════════════════════════════════════════════════ */
function SectionDivider({ color = "emerald" }: { color?: "emerald" | "blue" | "amber" }) {
  const colors = {
    emerald: "rgba(16, 185, 129, 0.25)",
    blue: "rgba(59, 130, 246, 0.25)",
    amber: "rgba(245, 158, 11, 0.25)",
  };
  return (
    <div className="relative py-2">
      <div
        className="mx-auto h-px"
        style={{
          maxWidth: "50%",
          background: `linear-gradient(90deg, transparent 0%, ${colors[color]} 50%, transparent 100%)`,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Features — Bento Grid (Linear-inspired)
   ═══════════════════════════════════════════════════ */
function Features() {
  const features = [
    {
      icon: "🔍",
      title: "AI-Powered Extraction",
      description:
        "Upload any hospital bill — PDF, image, or scan. Our engine extracts every line item, CPT code, and charge using advanced OCR and NLP.",
      span: "col-span-1 md:col-span-2",
      accentColor: "#10B981",
    },
    {
      icon: "📊",
      title: "Benchmark Engine",
      description:
        "Instantly compare charges against CGHS, PMJAY, and NPPA databases. Variance calculated to the decimal.",
      span: "col-span-1",
      accentColor: "#3B82F6",
    },
    {
      icon: "⚡",
      title: "Variance Flags",
      description:
        "Amber-flagged anomalies. No false alarms — every flag is statistically significant.",
      span: "col-span-1",
      accentColor: "#F59E0B",
    },
    {
      icon: "🛡",
      title: "Confidence Scoring",
      description:
        "Each audit generates a confidence score reflecting data quality, match depth, and statistical reliability.",
      span: "col-span-1",
      accentColor: "#10B981",
    },
    {
      icon: "🔔",
      title: "Real-Time Alerts",
      description:
        "Instant notifications when anomalies are detected. Stay informed with smart, priority-based alerts across all your audits.",
      span: "col-span-1",
      accentColor: "#F59E0B",
    },
    {
      icon: "📋",
      title: "Dispute Documentation",
      description:
        "Auto-generated, legally-formatted dispute letters with variance evidence, benchmark citations, and regulatory references.",
      span: "col-span-1 md:col-span-3",
      accentColor: "#3B82F6",
    },
  ];

  return (
    <section id="features" className="relative py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span
              className="text-micro inline-block mb-4 px-4 py-1.5 rounded-full"
              style={{
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#10B981",
                background: "rgba(16, 185, 129, 0.05)",
              }}
            >
              Features
            </span>
            <h2
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 52px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "var(--text-primary)",
              }}
            >
              Intelligence at every layer.
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <AnimatedSection
              key={i}
              delay={i * 0.08}
              className={feature.span}
            >
              <div
                className="bento-card group relative rounded-2xl p-7 h-full"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  transition: "all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = `${feature.accentColor}33`;
                  el.style.boxShadow = `0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px ${feature.accentColor}10`;
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "rgba(255,255,255,0.06)";
                  el.style.boxShadow = "none";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Icon with accent glow */}
                <div
                  className="mb-4 w-10 h-10 flex items-center justify-center rounded-lg text-lg"
                  style={{
                    background: `${feature.accentColor}12`,
                    border: `1px solid ${feature.accentColor}25`,
                  }}
                >
                  {feature.icon}
                </div>

                <h3
                  className="text-section-title mb-2"
                  style={{
                    fontWeight: 600,
                    fontSize: "18px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   How It Works — Numbered Timeline
   ═══════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload",
      description:
        "Drag and drop your hospital bill. PDF, image, or scan — our engine handles them all. Zero setup required.",
    },
    {
      number: "02",
      title: "Extract",
      description:
        "AI-powered OCR and NLP extract every line item, CPT code, medication, and charge into structured data.",
    },
    {
      number: "03",
      title: "Benchmark",
      description:
        "Each item is compared against CGHS standard rates, PMJAY package costs, and NPPA ceiling prices.",
    },
    {
      number: "04",
      title: "Report",
      description:
        "Receive a confidence-scored audit report with variance flags, benchmark evidence, and dispute-ready documentation.",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-28 overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.5) 50%, transparent 100%)",
        }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <AnimatedSection>
          <div className="text-center mb-20">
            <span
              className="text-micro inline-block mb-4 px-4 py-1.5 rounded-full"
              style={{
                border: "1px solid rgba(59, 130, 246, 0.2)",
                color: "#3B82F6",
                background: "rgba(59, 130, 246, 0.05)",
              }}
            >
              How It Works
            </span>
            <h2
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 52px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "var(--text-primary)",
              }}
            >
              Four steps. Full clarity.
            </h2>
          </div>
        </AnimatedSection>

        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute left-[28px] md:left-[36px] top-0 bottom-0 w-px"
            style={{
              background:
                "linear-gradient(180deg, rgba(59, 130, 246, 0.4) 0%, rgba(16, 185, 129, 0.4) 100%)",
            }}
          />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.12}>
                <div className="flex gap-6 md:gap-10 items-start">
                  {/* Step number */}
                  <div
                    className="relative z-10 flex-shrink-0 w-14 h-14 md:w-18 md:h-18 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      fontFamily: "'Satoshi', sans-serif",
                      fontWeight: 700,
                      fontSize: "20px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {step.number}
                  </div>

                  <div className="pt-2">
                    <h3
                      className="mb-2"
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontWeight: 600,
                        fontSize: "24px",
                        color: "var(--text-primary)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "15px",
                        lineHeight: 1.7,
                        maxWidth: "480px",
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   Pricing — Gradient borders + floating badge
   ═══════════════════════════════════════════════════ */
function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      priceNote: "3 bills / month",
      features: [
        "Basic line-item extraction",
        "CGHS benchmark comparison",
        "PDF export",
        "Email support",
      ],
      cta: "Start Free",
      featured: false,
    },
    {
      name: "Professional",
      price: "₹999",
      priceNote: "/month",
      features: [
        "Unlimited bill analysis",
        "CGHS + PMJAY + NPPA benchmarks",
        "Dispute letter generation",
        "Confidence scoring",
        "API access",
        "Priority support",
      ],
      cta: "Start Trial",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      priceNote: "Contact sales",
      features: [
        "Volume pricing",
        "SSO / SAML",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantees",
        "On-premise deployment",
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span
              className="text-micro inline-block mb-4 px-4 py-1.5 rounded-full"
              style={{
                border: "1px solid rgba(245, 158, 11, 0.2)",
                color: "#F59E0B",
                background: "rgba(245, 158, 11, 0.05)",
              }}
            >
              Pricing
            </span>
            <h2
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 52px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "var(--text-primary)",
              }}
            >
              Transparent pricing.<br />No hidden charges.
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div
                className="relative rounded-2xl p-7 h-full flex flex-col"
                style={{
                  background: plan.featured
                    ? "rgba(16, 185, 129, 0.04)"
                    : "rgba(255, 255, 255, 0.02)",
                  border: plan.featured
                    ? "1px solid rgba(16, 185, 129, 0.25)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  boxShadow: plan.featured
                    ? "0 0 40px rgba(16, 185, 129, 0.08), 0 10px 40px rgba(0,0,0,0.2)"
                    : "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!plan.featured) {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.12)";
                    e.currentTarget.style.transform =
                      "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 40px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.featured) {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform =
                      "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "none";
                  }
                }}
              >
                {/* Popular badge */}
                {plan.featured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-micro px-4 py-1 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #10B981, #059669)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      boxShadow:
                        "0 4px 16px rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className="text-section-title mb-1"
                    style={{
                      fontSize: "16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontWeight: 700,
                        fontSize: "36px",
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {plan.price}
                    </span>
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "14px",
                      }}
                    >
                      {plan.priceNote}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-3"
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M4 8l3 3 5-5"
                          stroke="#10B981"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={
                    plan.featured
                      ? "btn-primary w-full"
                      : "btn-secondary w-full"
                  }
                  style={{
                    fontSize: "14px",
                    padding: "12px 24px",
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   Trust — Animated security badges + data flow
   ═══════════════════════════════════════════════════ */
function Trust() {
  return (
    <section id="security" className="relative py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span
              className="text-micro inline-block mb-4 px-4 py-1.5 rounded-full"
              style={{
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#10B981",
                background: "rgba(16, 185, 129, 0.05)",
              }}
            >
              Trust & Security
            </span>
            <h2
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 52px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "var(--text-primary)",
              }}
            >
              Enterprise-grade security.<br />Zero compromise.
            </h2>
          </div>
        </AnimatedSection>

        {/* Security badges grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: "AES-256 Encryption",
              description: "All data encrypted at rest and in transit with military-grade encryption.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
              title: "Zero-Trust Architecture",
              description: "Every request is verified. No implicit trust. Containerized processing.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              ),
              title: "HIPAA Compliant",
              description: "PHI handling follows strict HIPAA guidelines with full audit trails.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
              title: "99.9% Uptime SLA",
              description: "Globally distributed infrastructure with automatic failover.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ),
              title: "SOC 2 Type II",
              description: "Annual independent audit of security, availability, and confidentiality.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              ),
              title: "Data Isolation",
              description: "Each tenant's data is processed and stored in isolated containers.",
            },
          ].map((badge, i) => (
            <AnimatedSection key={i} delay={i * 0.08}>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform =
                    "translateY(0)";
                }}
              >
                <div className="mb-4">{badge.icon}</div>
                <h3
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "var(--text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  {badge.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    lineHeight: 1.7,
                  }}
                >
                  {badge.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CTA — Gradient background with ambient glow
   ═══════════════════════════════════════════════════ */
function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Radial gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <AnimatedSection>
          <h2
            className="mb-6"
            style={{
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(36px, 6vw, 64px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              background:
                "linear-gradient(180deg, #E2E8F0 0%, #94A3B8 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Stop overpaying.
            <br />
            Start understanding.
          </h2>
          <p
            className="mb-10"
            style={{
              color: "var(--text-secondary)",
              fontSize: "18px",
              lineHeight: 1.7,
              maxWidth: "520px",
              margin: "0 auto 40px",
            }}
          >
            Upload your first hospital bill and receive a
            structured benchmark analysis in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="btn-primary"
              style={{
                padding: "14px 36px",
                fontSize: "16px",
                borderRadius: "14px",
              }}
            >
              Upload Your Bill →
            </button>
            <button
              className="btn-secondary"
              style={{
                padding: "14px 36px",
                fontSize: "16px",
                borderRadius: "14px",
              }}
            >
              Watch Demo
            </button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   Footer — Clean multi-column
   ═══════════════════════════════════════════════════ */
function Footer() {
  const columns = [
    {
      title: "Product",
      links: ["Features", "Pricing", "API Docs", "Changelog"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Press"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "HIPAA Compliance"],
    },
  ];

  return (
    <footer
      className="py-16"
      style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background:
                    "linear-gradient(135deg, #10B981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#fff",
                }}
              >
                BS
              </div>
              <span
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "var(--text-primary)",
                }}
              >
                BillSentry
              </span>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              India&apos;s first healthcare billing intelligence
              platform.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4
                className="text-micro mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "13px",
                        textDecoration: "none",
                        transition:
                          "color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                      (e.currentTarget.style.color =
                        "var(--text-primary)")
                      }
                      onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        "var(--text-muted)")
                      }
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
          }}
        >
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "12px",
            }}
          >
            © 2026 BillSentry Health. All rights reserved.
          </span>
          <div className="flex gap-6">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a
                key={social}
                href="#"
                style={{
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) =>
                (e.currentTarget.style.color =
                  "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  "var(--text-muted)")
                }
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page Assembly
   ═══════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main>
      <Navbar />
      <CinematicHero />
      <SectionDivider color="emerald" />
      <StatsBar />
      <SectionDivider color="blue" />
      <Features />
      <SectionDivider color="emerald" />
      <HowItWorks />
      <SectionDivider color="amber" />
      <Pricing />
      <SectionDivider color="emerald" />
      <Trust />
      <CTA />
      <Footer />
    </main>
  );
}
