"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
    {
        id: "upload",
        number: "01",
        title: "Upload",
        description: "Drag and drop your hospital bill. PDF, image, or scan — our engine handles them all. Zero setup required.",
        accent: "#000000",
    },
    {
        id: "extract",
        number: "02",
        title: "Extract",
        description: "AI-powered OCR and NLP extract every line item, CPT code, medication, and charge into structured data.",
        accent: "#111827",
    },
    {
        id: "benchmark",
        number: "03",
        title: "Benchmark",
        description: "Each item is compared against CGHS standard rates, PMJAY package costs, and NPPA ceiling prices.",
        accent: "#F59E0B",
    },
    {
        id: "report",
        number: "04",
        title: "Report",
        description: "Receive a confidence-scored audit report with variance flags, benchmark evidence, and dispute-ready documentation.",
        accent: "#000000",
    },
];

export default function HowItWorksTabs() {
    const [activeTab, setActiveTab] = useState(steps[0].id);

    const activeStepIndex = steps.findIndex((s) => s.id === activeTab);
    const activeStep = steps[activeStepIndex];

    return (
        <section id="how-it-works" className="relative py-28 overflow-hidden bg-white">
            {/* Background radial glow based on active tab */}
            <div className="absolute inset-0 transition-colors duration-1000" style={{
                background: `radial-gradient(circle at 50% 50%, ${activeStep.accent}10 0%, transparent 60%)`
            }} />

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span
                        className="text-micro inline-block mb-4 px-4 py-1.5 rounded-full"
                        style={{
                            border: `1px solid ${activeStep.accent}30`,
                            color: activeStep.accent,
                            background: `${activeStep.accent}10`,
                            transition: "all 0.5s ease"
                        }}
                    >
                        How It Works
                    </span>
                    <h2
                        style={{
                            fontFamily: "'Clash Display', 'Satoshi', sans-serif",
                            fontWeight: 600,
                            fontSize: "clamp(36px, 5vw, 56px)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                            color: "#FFFFFF",
                        }}
                    >
                        Four steps. <span style={{ color: "#8892B0" }}>Full clarity.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
                    {/* Tabs Menu */}
                    <div className="col-span-1 md:col-span-4 flex flex-col gap-2 relative">
                        {/* Vertical connector line */}
                        <div className="absolute left-6 md:left-8 top-8 bottom-8 w-px bg-white z-0 hidden md:block" />

                        {steps.map((step) => {
                            const isActive = activeTab === step.id;
                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveTab(step.id)}
                                    className={`group relative text-left p-4 rounded-xl transition-all duration-300 z-10 ${isActive ? "bg-white" : "hover:bg-white"
                                        }`}
                                    style={{
                                        border: isActive ? `1px solid ${step.accent}20` : "1px solid transparent",
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-500`}
                                            style={{
                                                background: isActive ? `${step.accent}15` : "rgba(255,255,255,0.03)",
                                                color: isActive ? step.accent : "#64748b",
                                                border: isActive ? `1px solid ${step.accent}30` : "1px solid rgba(255,255,255,0.1)",
                                                boxShadow: isActive ? `0 0 15px ${step.accent}20` : "none"
                                            }}
                                        >
                                            {step.number}
                                        </div>
                                        <span
                                            className="text-lg font-semibold transition-colors duration-300"
                                            style={{
                                                fontFamily: "'Satoshi', sans-serif",
                                                color: isActive ? "#FFFFFF" : "#8892B0"
                                            }}
                                        >
                                            {step.title}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content Display */}
                    <div className="col-span-1 md:col-span-8 relative min-h-[300px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="p-8 md:p-12 rounded-3xl"
                                style={{
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                                }}
                            >
                                <div className="mb-8">
                                    <div
                                        className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6"
                                        style={{
                                            background: `linear-gradient(135deg, ${activeStep.accent}20 0%, transparent 100%)`,
                                            border: `1px solid ${activeStep.accent}30`,
                                            color: activeStep.accent,
                                            fontSize: "24px",
                                            fontWeight: "bold",
                                            fontFamily: "'Clash Display', sans-serif"
                                        }}
                                    >
                                        {activeStep.number}
                                    </div>
                                    <h3
                                        style={{
                                            fontFamily: "'Clash Display', 'Satoshi', sans-serif",
                                            fontWeight: 600,
                                            fontSize: "clamp(28px, 4vw, 42px)",
                                            color: "#FFFFFF",
                                            letterSpacing: "-0.02em",
                                            marginBottom: "1rem"
                                        }}
                                    >
                                        {activeStep.title}
                                    </h3>
                                    <p
                                        style={{
                                            color: "#8892B0",
                                            fontSize: "clamp(18px, 2.5vw, 22px)",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {activeStep.description}
                                    </p>
                                </div>

                                {/* Visual placeholder for the tab content (could be images/animations later) */}
                                <div className="w-full h-48 rounded-xl overflow-hidden relative" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.03)" }}>
                                    <div className="absolute inset-0 opacity-20" style={{
                                        backgroundImage: `radial-gradient(circle at 50% 50%, ${activeStep.accent} 2px, transparent 2px)`,
                                        backgroundSize: "24px 24px"
                                    }} />
                                    {/* A cool animated scanning line */}
                                    <motion.div
                                        className="absolute left-0 right-0 h-px will-change-transform"
                                        style={{ background: activeStep.accent, boxShadow: `0 0 15px ${activeStep.accent}` }}
                                        animate={{ y: ["0%", "4000%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
