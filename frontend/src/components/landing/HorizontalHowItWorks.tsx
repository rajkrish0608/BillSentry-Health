"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        number: "01",
        title: "Upload",
        description: "Drop your hospital bill into the secure vault. We accept PDFs, images, and scanned documents.",
    },
    {
        number: "02",
        title: "Extract",
        description: "Our proprietary AI engine instantly extracts line items, ICD-10 codes, CPT codes, and billed amounts.",
    },
    {
        number: "03",
        title: "Benchmark",
        description: "Each item is compared against CGHS standard rates, PMJAY package costs, and NPPA ceiling prices.",
    },
    {
        number: "04",
        title: "Report",
        description: "Receive a confidence-scored audit report with variance flags, benchmark evidence, and dispute-ready documentation.",
    },
];

export default function HorizontalHowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !scrollWrapperRef.current) return;

        // Use GSAP context for easy cleanup
        const ctx = gsap.context(() => {
            const sections = gsap.utils.toArray(".horizontal-step");

            // The pinning animation
            gsap.to(sections, {
                xPercent: -100 * (sections.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    pin: true,
                    scrub: 1,
                    snap: {
                        snapTo: 1 / (sections.length - 1),
                        duration: 0.5,
                        ease: "power1.inOut"
                    },
                    // The total scroll distance is based on the width of the container
                    end: () => "+=" + containerRef.current!.offsetWidth * (sections.length - 1),
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative h-screen w-full bg-white overflow-hidden flex flex-col justify-center">
            {/* Background radial glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full point-events-none"
                style={{
                    background: "radial-gradient(circle, rgba(0, 240, 255, 0.03) 0%, transparent 70%)",
                    filter: "blur(100px)",
                }}
            />

            {/* Section Header (Fixed position while scrolling) */}
            <div className="absolute top-24 left-10 md:left-24 z-20">
                <span
                    className="text-micro inline-block mb-4 px-5 py-2 rounded-full"
                    style={{
                        border: "1px solid rgba(0, 230, 118, 0.2)",
                        color: "#111827",
                        background: "rgba(0, 230, 118, 0.05)",
                        boxShadow: "0 0 20px rgba(0, 230, 118, 0.1)",
                    }}
                >
                    How It Works
                </span>
                <h2
                    style={{
                        fontFamily: "'Clash Display', 'Satoshi', sans-serif",
                        fontWeight: 600,
                        fontSize: "clamp(48px, 6vw, 72px)",
                        letterSpacing: "-0.03em",
                        lineHeight: 1.1,
                        color: "#FFFFFF",
                        textShadow: "0 4px 30px rgba(0,240,255,0.1)",
                    }}
                >
                    Four phases to
                    <br />
                    <span style={{ color: "#8892B0" }}>total transparency.</span>
                </h2>
            </div>

            {/* Horizontal Scrolling Wrapper */}
            <div
                ref={scrollWrapperRef}
                className="relative flex h-full pt-48 items-center"
                style={{ width: `${steps.length * 100}vw` }}
            >
                {steps.map((step, i) => (
                    <div
                        key={i}
                        className="horizontal-step flex-shrink-0 w-screen h-full flex flex-col justify-center px-10 md:px-24"
                    >
                        <div className="relative max-w-3xl">
                            {/* Large Background Number */}
                            <div
                                className="absolute -top-32 -left-10 text-[240px] md:text-[320px] font-bold leading-none pointer-events-none select-none z-0"
                                style={{
                                    fontFamily: "'Clash Display', sans-serif",
                                    WebkitTextStroke: "2px rgba(255, 255, 255, 0.03)",
                                    color: "transparent",
                                }}
                            >
                                {step.number}
                            </div>

                            <div className="relative z-10 p-12 rounded-3xl backdrop-blur-md"
                                style={{
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                                }}
                            >
                                <div className="flex items-center gap-6 mb-8">
                                    <div
                                        className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 230, 118, 0.15) 100%)",
                                            border: "1px solid rgba(0, 240, 255, 0.2)",
                                            color: "#000000",
                                            boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)"
                                        }}
                                    >
                                        {step.number}
                                    </div>
                                    <h3
                                        style={{
                                            fontFamily: "'Satoshi', sans-serif",
                                            fontWeight: 600,
                                            fontSize: "clamp(32px, 4vw, 48px)",
                                            color: "#FFFFFF",
                                            letterSpacing: "-0.02em",
                                        }}
                                    >
                                        {step.title}
                                    </h3>
                                </div>

                                <p
                                    style={{
                                        color: "#8892B0",
                                        fontSize: "clamp(20px, 2.5vw, 24px)",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
