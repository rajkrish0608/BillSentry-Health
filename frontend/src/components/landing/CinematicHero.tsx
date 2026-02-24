"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// Dynamic import for Three.js (no SSR)
const HeroScene3D = dynamic(
    () => import("@/components/three/HeroScene3D"),
    { ssr: false }
);

/* ═══════════════════════════════════════════════════
   Animated Number Counter with Psychological Pause
   ═══════════════════════════════════════════════════ */
function ConfidenceCounter({
    target,
    suffix = "",
    inView,
}: {
    target: number;
    suffix?: string;
    inView: boolean;
}) {
    const [display, setDisplay] = useState(0);
    const hasRun = useRef(false);

    useEffect(() => {
        if (!inView || hasRun.current) return;
        hasRun.current = true;

        const anime = require("animejs");
        const obj = { value: 0 };

        // Timeline: fast count → pause → slow final tick
        const tl = anime.timeline({ easing: "easeOutExpo" });

        tl.add({
            targets: obj,
            value: target - 2,
            duration: 1200,
            round: 1,
            update: () => setDisplay(Math.round(obj.value)),
        })
            .add({ duration: 350 }) // Psychological pause
            .add({
                targets: obj,
                value: target,
                duration: 800,
                easing: "easeOutSine",
                round: 1,
                update: () => setDisplay(Math.round(obj.value)),
            });
    }, [inView, target]);

    return (
        <span>
            {display}
            {suffix}
        </span>
    );
}

/* ═══════════════════════════════════════════════════
   Scroll Narrative Overlays (text that fades in/out)
   ═══════════════════════════════════════════════════ */
const narrativeSlides = [
    {
        range: [0, 0.22],
        title: "Hospital bills shouldn't\nbe a mystery.",
        subtitle:
            "Complex charges. Opaque pricing. Zero transparency. The system is designed to confuse.",
    },
    {
        range: [0.22, 0.48],
        title: "Intelligence begins\nwith structure.",
        subtitle:
            "Our AI scans every line item, extracts structured data, and maps each charge to its category.",
    },
    {
        range: [0.48, 0.72],
        title: "From chaos\nto clarity.",
        subtitle:
            "Each item is benchmarked against CGHS, PMJAY, and NPPA public databases. Variance is calculated to the decimal.",
    },
    {
        range: [0.72, 1.0],
        title: "Confidence.\nDelivered.",
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
                const translateY = (1 - opacity) * 30;

                return (
                    <div
                        key={i}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
                        style={{
                            opacity,
                            transform: `translateY(${translateY}px)`,
                            zIndex: 20,
                        }}
                    >
                        <h2
                            className="text-display whitespace-pre-line mb-6"
                            style={{
                                background:
                                    "linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontSize: "clamp(28px, 5vw, 52px)",
                            }}
                        >
                            {slide.title}
                        </h2>
                        <p
                            className="max-w-xl"
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "clamp(14px, 2vw, 18px)",
                                lineHeight: 1.7,
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
   Cinematic Hero Section
   ═══════════════════════════════════════════════════ */
export default function CinematicHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Scroll tracking — the hero section spans 400vh
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const sectionHeight = containerRef.current.offsetHeight - window.innerHeight;
            const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));
            setScrollProgress(progress);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative"
            style={{ height: "400vh" }}
        >
            {/* Sticky viewport */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Gradient orbs behind the canvas */}
                <div
                    className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px]"
                    style={{
                        background: "var(--accent-emerald)",
                        opacity: 0.08 + scrollProgress * 0.12,
                        transition: "opacity 0.3s",
                    }}
                />
                <div
                    className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[128px]"
                    style={{
                        background: "var(--accent-amber)",
                        opacity: 0.05 + scrollProgress * 0.08,
                        transition: "opacity 0.3s",
                    }}
                />

                {/* 3D Canvas */}
                <HeroScene3D scrollProgress={scrollProgress} />

                {/* Narrative text overlays */}
                <NarrativeOverlay scrollProgress={scrollProgress} />

                {/* Scroll indicator at bottom */}
                <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30"
                    style={{ opacity: Math.max(0, 1 - scrollProgress * 4) }}
                >
                    <span className="text-micro" style={{ color: "var(--text-muted)" }}>
                        Scroll to explore
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--text-muted)"
                            strokeWidth="2"
                        >
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                    </motion.div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 h-[2px] z-30" style={{ width: "100%" }}>
                    <div
                        className="h-full"
                        style={{
                            width: `${scrollProgress * 100}%`,
                            background:
                                "linear-gradient(90deg, var(--accent-emerald), var(--accent-amber))",
                            transition: "width 0.1s linear",
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
