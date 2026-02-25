"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";

// Dynamic import for Three.js (no SSR)
const HeroScene3D = dynamic(
    () => import("@/components/three/HeroScene3D"),
    { ssr: false }
);

/* ═══════════════════════════════════════════════════
   Animated Word Reveal — words appear one by one
   ═══════════════════════════════════════════════════ */
function WordReveal({
    text,
    scrollProgress,
    range,
    className,
    style,
}: {
    text: string;
    scrollProgress: number;
    range: [number, number];
    className?: string;
    style?: React.CSSProperties;
}) {
    const words = text.split(" ");
    const [start, end] = range;
    const mid = (start + end) / 2;
    const fadeIn = Math.max(0, Math.min(1, (scrollProgress - start) / (mid - start)));
    const fadeOut = Math.max(0, Math.min(1, (end - scrollProgress) / (end - mid)));
    const sectionOpacity = Math.min(fadeIn, fadeOut);

    return (
        <span className={className} style={{ ...style, display: "inline" }}>
            {words.map((word, i) => {
                const wordDelay = i / words.length;
                const wordProgress = Math.max(0, Math.min(1, (fadeIn - wordDelay * 0.5) / 0.5));
                return (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            opacity: wordProgress * sectionOpacity,
                            transform: `translateY(${(1 - wordProgress) * 20}px)`,
                            transition: "none",
                            marginRight: "0.3em",
                        }}
                    >
                        {word}
                    </span>
                );
            })}
        </span>
    );
}

/* ═══════════════════════════════════════════════════
   Scroll Narrative Overlays — dramatically larger text
   ═══════════════════════════════════════════════════ */
const narrativeSlides = [
    {
        range: [0, 0.22] as [number, number],
        title: "Hospital bills shouldn't be a mystery.",
        subtitle:
            "Complex charges. Opaque pricing. Zero transparency. The system is designed to confuse.",
    },
    {
        range: [0.22, 0.48] as [number, number],
        title: "Intelligence begins with structure.",
        subtitle:
            "Our AI scans every line item, extracts structured data, and maps each charge to its category.",
    },
    {
        range: [0.48, 0.72] as [number, number],
        title: "From chaos to clarity.",
        subtitle:
            "Each item is benchmarked against CGHS, PMJAY, and NPPA public databases. Variance is calculated to the decimal.",
    },
    {
        range: [0.72, 1.0] as [number, number],
        title: "Confidence. Delivered.",
        subtitle:
            "A structured audit report with confidence scoring, variance flags, and optional dispute documentation.",
    },
];

function NarrativeOverlay({ scrollProgress }: { scrollProgress: number }) {
    return (
        <>
            {narrativeSlides.map((slide, i) => {
                const [start, end] = slide.range;
                const mid = (start + end) / 2;
                const fadeIn = Math.max(
                    0,
                    Math.min(1, (scrollProgress - start) / (mid - start))
                );
                const fadeOut = Math.max(
                    0,
                    Math.min(1, (end - scrollProgress) / (end - mid))
                );
                const opacity = Math.min(fadeIn, fadeOut);
                const translateY = (1 - opacity) * 40;
                const scale = 0.95 + opacity * 0.05;

                return (
                    <div
                        key={i}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
                        style={{
                            opacity,
                            transform: `translateY(${translateY}px) scale(${scale})`,
                            zIndex: 20,
                        }}
                    >
                        {/* Dark scrim for text readability */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.4) 50%, transparent 80%)",
                                pointerEvents: "none",
                            }}
                        />
                        {/* Word-by-word reveal for headline */}
                        <h2
                            className="mb-6 leading-tight relative z-10"
                            style={{
                                fontFamily: "'Clash Display', 'Satoshi', sans-serif",
                                fontWeight: 600,
                                fontSize: "clamp(48px, 8vw, 96px)",
                                letterSpacing: "-0.04em",
                                lineHeight: 1.05,
                                background:
                                    "linear-gradient(180deg, #FFFFFF 0%, #8892B0 80%, #495670 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                maxWidth: "1000px",
                                textShadow: "0 4px 30px rgba(0,240,255,0.1)",
                            }}
                        >
                            <WordReveal
                                text={slide.title}
                                scrollProgress={scrollProgress}
                                range={slide.range}
                            />
                        </h2>
                        <p
                            className="max-w-2xl relative z-10"
                            style={{
                                color: "#8892B0",
                                fontSize: "clamp(16px, 2.5vw, 24px)",
                                lineHeight: 1.6,
                                opacity: opacity * 0.9,
                                letterSpacing: "0.02em",
                                fontWeight: 400,
                            }}
                        >
                            {slide.subtitle}
                        </p>
                    </div>
                );
            })}
        </>
    );
}

/* ═══════════════════════════════════════════════════
   Cinematic Hero Section — Premium Redesign
   ═══════════════════════════════════════════════════ */
export default function CinematicHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Scroll tracking — the hero section spans 500vh
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const sectionHeight =
                containerRef.current.offsetHeight - window.innerHeight;
            const progress = Math.max(
                0,
                Math.min(1, -rect.top / sectionHeight)
            );
            setScrollProgress(progress);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative"
            style={{ height: "500vh" }}
        >
            {/* Sticky viewport */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Dot grid background pattern */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                        backgroundSize: "32px 32px",
                        opacity: 0.8 + scrollProgress * 0.2,
                    }}
                />

                {/* Animated gradient orbs — Tech Void style */}
                <div
                    className="absolute rounded-full"
                    style={{
                        top: "20%",
                        left: "15%",
                        width: "800px",
                        height: "800px",
                        background:
                            "radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 60%)",
                        filter: "blur(100px)",
                        transform: `translate(${scrollProgress * 80}px, ${scrollProgress * -60}px)`,
                        transition: "transform 0.5s ease-out",
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        bottom: "10%",
                        right: "5%",
                        width: "900px",
                        height: "900px",
                        background:
                            "radial-gradient(circle, rgba(0, 230, 118, 0.06) 0%, transparent 60%)",
                        filter: "blur(120px)",
                        transform: `translate(${scrollProgress * -70}px, ${scrollProgress * 50}px)`,
                        transition: "transform 0.5s ease-out",
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        top: "40%",
                        left: "50%",
                        width: "600px",
                        height: "600px",
                        background:
                            "radial-gradient(circle, rgba(245, 158, 11, 0.04) 0%, transparent 70%)",
                        filter: "blur(100px)",
                        transform: `translate(${scrollProgress * 40}px, ${scrollProgress * -30}px) scale(${1 + scrollProgress * 0.2})`,
                        transition: "transform 0.5s ease-out",
                    }}
                />

                {/* 3D Canvas */}
                <HeroScene3D scrollProgress={scrollProgress} />

                {/* Above-the-fold hero content — visible before scroll */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20"
                    style={{
                        opacity: Math.max(0, 1 - scrollProgress * 6),
                        pointerEvents: scrollProgress > 0.1 ? "none" : "auto",
                        transform: `translateY(${scrollProgress * -120}px)`,
                        transition: "opacity 0.15s ease",
                    }}
                >
                    {/* Dark backdrop for readability */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse at 50% 45%, rgba(5, 5, 5, 0.8) 0%, transparent 70%)",
                            pointerEvents: "none",
                        }}
                    />
                    <span
                        className="text-micro inline-block mb-6 px-5 py-2 rounded-full relative z-10"
                        style={{
                            border: "1px solid rgba(0, 240, 255, 0.3)",
                            color: "#000000",
                            background: "rgba(0, 240, 255, 0.05)",
                            fontSize: "12px",
                            letterSpacing: "0.15em",
                            boxShadow: "0 0 20px rgba(0,240,255,0.15)",
                        }}
                    >
                        AI-POWERED BILLING INTELLIGENCE
                    </span>
                    <h1
                        className="mb-6 leading-none relative z-10"
                        style={{
                            fontFamily: "'Clash Display', 'Satoshi', sans-serif",
                            fontWeight: 600,
                            fontSize: "clamp(48px, 8vw, 92px)",
                            letterSpacing: "-0.04em",
                            background:
                                "linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 40%, #8892B0 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            maxWidth: "900px",
                            textShadow: "0 4px 40px rgba(0,240,255,0.15)",
                        }}
                    >
                        Decode your hospital bill. Instantly.
                    </h1>
                    <p
                        className="max-w-lg mb-8 relative z-10"
                        style={{
                            color: "#94A3B8",
                            fontSize: "clamp(16px, 2vw, 20px)",
                            lineHeight: 1.7,
                            letterSpacing: "0.01em",
                        }}
                    >
                        Upload any hospital bill. Our AI extracts every charge,
                        benchmarks it against government databases, and delivers
                        a confidence-scored audit report.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <button
                            className="btn-primary"
                            style={{
                                padding: "14px 32px",
                                fontSize: "15px",
                                borderRadius: "14px",
                            }}
                        >
                            Upload Your Bill →
                        </button>
                        <button
                            className="btn-secondary"
                            style={{
                                padding: "14px 32px",
                                fontSize: "15px",
                                borderRadius: "14px",
                            }}
                        >
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Narrative text overlays */}
                <NarrativeOverlay scrollProgress={scrollProgress} />

                {/* Scene indicator dots */}
                <div
                    className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30"
                    style={{ opacity: 0.6 }}
                >
                    {[0, 1, 2, 3].map((i) => {
                        const sceneProgress = i / 4;
                        const isActive =
                            scrollProgress >= sceneProgress &&
                            scrollProgress < sceneProgress + 0.25;
                        return (
                            <div
                                key={i}
                                style={{
                                    width: isActive ? "3px" : "3px",
                                    height: isActive ? "24px" : "8px",
                                    borderRadius: "2px",
                                    background: isActive
                                        ? "#10B981"
                                        : "rgba(148, 163, 184, 0.3)",
                                    transition: "all 0.3s ease",
                                }}
                            />
                        );
                    })}
                </div>

                {/* Scroll indicator at bottom */}
                <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30"
                    style={{ opacity: Math.max(0, 1 - scrollProgress * 5) }}
                >
                    <span
                        className="text-micro"
                        style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
                    >
                        Scroll to explore
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--text-muted)"
                            strokeWidth="1.5"
                        >
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                    </motion.div>
                </div>

                {/* Progress bar — gradient line */}
                <div
                    className="absolute bottom-0 left-0 h-[2px] z-30"
                    style={{ width: "100%" }}
                >
                    <div
                        className="h-full"
                        style={{
                            width: `${scrollProgress * 100}%`,
                            background:
                                "linear-gradient(90deg, #000000 0%, #111827 100%)",
                            transition: "width 0.1s linear",
                            boxShadow: "0 0 15px rgba(0, 240, 255, 0.5)",
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
