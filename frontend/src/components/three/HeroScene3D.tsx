"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import ParticleField from "./ParticleField";
import FloatingDocument from "./FloatingDocument";
import MetricCards from "./MetricCards";

/**
 * The cinematic 3D hero scene — Premium Redesign.
 *
 * Scene Flow (scroll-driven):
 *   0.0 – 0.25  →  Scene 1: Opaque Bill (floating document, chaotic particles)
 *   0.25 – 0.50 →  Scene 2: Intelligence Scan (emerald beam sweeps the bill)
 *   0.50 – 0.75 →  Scene 3: Structural Transformation (particles snap to grid)
 *   0.75 – 1.0  →  Scene 4: Confidence Score Reveal (metric cards appear)
 */
export default function HeroScene3D({
    scrollProgress = 0,
}: {
    scrollProgress: number;
}) {
    return (
        <Canvas
            camera={{ position: [0, 0, 7], fov: 50 }}
            dpr={[1, 2]}
            gl={{
                antialias: true,
                alpha: false,
            }}
            onCreated={({ gl }) => {
                // Match page background — eliminates the black box
                gl.setClearColor("#050505", 1);
            }}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }}
        >
            <Suspense fallback={null}>
                {/* Layered lighting for depth */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={0.7}
                    color="#E2E8F0"
                />
                {/* Neon Cyan accent light — top-left */}
                <pointLight
                    position={[-4, 3, 4]}
                    intensity={0.8}
                    color="#00F0FF"
                    distance={20}
                />
                {/* Neon Mint accent — bottom-right for depth */}
                <pointLight
                    position={[4, -2, 3]}
                    intensity={0.5}
                    color="#00E676"
                    distance={20}
                />
                {/* Subtle blue fill from behind */}
                <pointLight
                    position={[0, 0, -5]}
                    intensity={0.3}
                    color="#3B82F6"
                    distance={25}
                />

                {/* Scene 1 + 2: Floating document with scan shader */}
                <FloatingDocument scrollProgress={scrollProgress} />

                {/* Scene 2 + 3: Particle field goes from chaos to order */}
                <ParticleField
                    count={1200}
                    scrollProgress={Math.max(0, (scrollProgress - 0.2) / 0.5)}
                />

                {/* Scene 4: Metric cards emerge */}
                <MetricCards scrollProgress={scrollProgress} />
            </Suspense>
        </Canvas>
    );
}
