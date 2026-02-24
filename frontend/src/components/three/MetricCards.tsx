"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Floating glassmorphic metric cards that emerge from the dissolved document.
 * They represent the structured analytics output: variance bars, scores, etc.
 */
export default function MetricCards({
    scrollProgress = 0,
}: {
    scrollProgress?: number;
}) {
    const groupRef = useRef<THREE.Group>(null!);

    const cards = useMemo(
        () => [
            { pos: [-2.2, 1.0, 0.3], label: "Total Variance", color: "#F59E0B" },
            { pos: [2.2, 1.0, 0.3], label: "Risk Score", color: "#10B981" },
            { pos: [-2.2, -1.2, 0.3], label: "Overcharges", color: "#F59E0B" },
            { pos: [2.2, -1.2, 0.3], label: "Confidence", color: "#10B981" },
            { pos: [0, 0, 0.5], label: "Audit Report", color: "#3B82F6" },
        ],
        []
    );

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();

        // Cards appear only after 60% scroll progress
        const appearance = Math.max(0, (scrollProgress - 0.55) / 0.45);

        groupRef.current.children.forEach((child, i) => {
            const mesh = child as THREE.Mesh;
            const stagger = i * 0.12;
            const localProgress = Math.max(
                0,
                Math.min(1, (appearance - stagger) / 0.4)
            );

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - localProgress, 3);

            // Scale in
            mesh.scale.setScalar(eased);

            // Slide from below
            const baseY = cards[i].pos[1];
            mesh.position.y = baseY - (1 - eased) * 2;

            // Opacity
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.opacity = eased;

            // Subtle float
            mesh.position.y += Math.sin(time + i) * 0.04 * eased;
            mesh.rotation.y = Math.sin(time * 0.5 + i * 0.7) * 0.02;
        });
    });

    return (
        <group ref={groupRef}>
            {cards.map((card, i) => (
                <mesh key={i} position={card.pos as [number, number, number]}>
                    <boxGeometry args={[1.8, 0.9, 0.05]} />
                    <meshStandardMaterial
                        color={card.color}
                        transparent
                        opacity={0}
                        roughness={0.3}
                        metalness={0.1}
                        emissive={card.color}
                        emissiveIntensity={0.15}
                    />
                </mesh>
            ))}
        </group>
    );
}
