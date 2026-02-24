import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function AuthLayout({
    children,
    title,
    subtitle
}: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex overflow-hidden relative selection:bg-[var(--accent-emerald)] selection:text-white">

            {/* ── Background Elements ── */}
            <div
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-20"
                style={{ background: "var(--accent-emerald)" }}
            />
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none opacity-[0.08]"
                style={{ background: "var(--accent-amber)" }}
            />

            {/* ── Navbar Strip ── */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 group">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{
                            background: "linear-gradient(135deg, var(--accent-emerald), #059669)",
                            boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M9 12l2 2 4-4" />
                            <path d="M12 3a9 9 0 1 0 9 9" />
                        </svg>
                    </div>
                    <span className="text-section-title !text-base" style={{ color: "var(--text-primary)" }}>
                        BillSentry
                    </span>
                </Link>
                <Link href="/" className="text-data-label hover:text-[var(--text-primary)] hover:underline underline-offset-4">
                    Back to home
                </Link>
            </div>

            {/* ── Main Layout Split ── */}
            <div className="w-full flex">

                {/* Left: Interactive Form Side */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 z-10 animate-fade-in-up">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-10 text-center lg:text-left">
                            <h1 className="text-section-title !text-[28px] mb-2">{title}</h1>
                            <p className="text-tabular" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
                        </div>

                        <Card className="p-8 sm:p-10 mb-8 border border-[rgba(255,255,255,0.08)] bg-[rgba(15,23,42,0.6)] backdrop-blur-3xl shadow-2xl">
                            {children}
                        </Card>

                        <div className="text-center">
                            <p className="text-micro" style={{ color: "var(--text-muted)" }}>
                                Protected by AES-256 encryption. DPDP Act compliant.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Architectural Visual Side (Hidden on Mobile) */}
                <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-l border-[var(--border-glass)] bg-[rgba(255,255,255,0.01)]">

                    {/* Subtle Grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />

                    <div className="relative z-10 mt-16 max-w-sm ml-auto mr-12 text-right">
                        <h2 className="text-display !text-[32px] mb-4" style={{
                            background: "linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            Zero-Trust <br />Architecture.
                        </h2>
                        <p className="text-tabular text-[var(--text-secondary)] leading-relaxed">
                            Every analyzed file is encrypted at rest within our Mumbai-based AWS private subnets and subject to immediate erasure upon user request. We do not sell your data.
                        </p>
                    </div>

                    <div className="relative z-10 bg-[rgba(255,255,255,0.02)] backdrop-blur-md rounded-2xl border border-[var(--border-glass)] p-6 max-w-sm mr-auto ml-12 mb-16 animate-pulse-glow" style={{ animationDuration: '4s' }}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--accent-emerald-glow)] border border-[rgba(16,185,129,0.2)]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-data-label !text-xs !text-[var(--text-primary)]">Security Audit Complete</div>
                                <div className="text-micro mt-0.5" style={{ color: "var(--accent-emerald)" }}>Active Surveillance</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: "Connection", val: "TLS 1.3" },
                                { label: "Encryption", val: "AES-256-GCM" },
                                { label: "Data Center", val: "ap-south-1" }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-[var(--text-muted)] font-mono uppercase tracking-wider">{item.label}</span>
                                    <span className="text-[var(--text-secondary)] font-mono">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
