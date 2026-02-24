"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/**
 * Premium glassmorphic metric cards with HTML labels.
 *
 * Fixes from previous version:
 * - Replaced solid MeshStandardMaterial with custom glassmorphism shader
 * - Added actual text labels via drei's Html component
 * - Frosted-glass appearance with subtle noise
 * - Glowing border animation
 * - Better stagger timing for dramatic reveal
 */

interface CardData {
    pos: [number, number, number];
    label: string;
    value: string;
    color: string;
    icon: string;
}

export default function MetricCards({
    scrollProgress = 0,
}: {
    scrollProgress?: number;
}) {
    const groupRef = useRef<THREE.Group>(null!);

    const cards: CardData[] = useMemo(
        () => [
            {
                pos: [-2.4, 1.1, 0.3],
                label: "Total Variance",
                value: "47%",
                color: "#F59E0B",
                icon: "⚡",
            },
            {
                pos: [2.4, 1.1, 0.3],
                label: "Risk Score",
                value: "Low",
                color: "#10B981",
                icon: "🛡",
            },
            {
                pos: [-2.4, -1.3, 0.3],
                label: "Overcharges",
                value: "₹12,400",
                color: "#F59E0B",
                icon: "📊",
            },
            {
                pos: [2.4, -1.3, 0.3],
                label: "Confidence",
                value: "94%",
                color: "#10B981",
                icon: "✓",
            },
            {
                pos: [0, 0, 0.5],
                label: "Audit Report",
                value: "Complete",
                color: "#3B82F6",
                icon: "📋",
            },
        ],
        []
    );

    const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

    const fragmentShader = `
    uniform float uOpacity;
    uniform float uTime;
    uniform vec3 uBorderColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Simple noise for frosted glass effect
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      // Glass base — very dark with subtle noise texture
      float n = noise(vUv * 30.0 + uTime * 0.1) * 0.04;
      vec3 glassColor = vec3(0.06, 0.08, 0.14) + n;

      // Frosted glass surface noise
      float frost = noise(vUv * 60.0) * 0.02;
      glassColor += frost;

      // Border glow — thin luminous edge
      float borderX = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x);
      float borderY = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);
      float border = 1.0 - borderX * borderY;

      // Animated border shimmer
      float shimmer = sin(uTime * 2.0 + vUv.x * 10.0 + vUv.y * 10.0) * 0.5 + 0.5;
      glassColor += uBorderColor * border * (0.3 + shimmer * 0.3);

      // Edge fresnel for glass depth
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.5);
      glassColor += vec3(0.15, 0.2, 0.3) * fresnel * 0.4;

      // Inner glow at center
      float centerDist = length(vUv - 0.5);
      float innerGlow = smoothstep(0.5, 0.0, centerDist) * 0.05;
      glassColor += uBorderColor * innerGlow;

      gl_FragColor = vec4(glassColor, uOpacity * 0.85);
    }
  `;

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();

        // Cards appear only after 55% scroll progress
        const appearance = Math.max(0, (scrollProgress - 0.55) / 0.45);

        groupRef.current.children.forEach((child, i) => {
            // Skip HTML elements (only process mesh children)
            if (!(child instanceof THREE.Mesh)) return;

            const stagger = i * 0.15;
            const localProgress = Math.max(
                0,
                Math.min(1, (appearance - stagger) / 0.35)
            );

            // Smooth ease-out cubic
            const eased = 1 - Math.pow(1 - localProgress, 3);

            // Scale in
            child.scale.setScalar(eased);

            // Slide from below with slight rotation
            const baseY = cards[i].pos[1];
            child.position.y = baseY - (1 - eased) * 2.5;

            // Opacity
            const mat = child.material as THREE.ShaderMaterial;
            if (mat.uniforms?.uOpacity) {
                mat.uniforms.uOpacity.value = eased;
                mat.uniforms.uTime.value = time;
            }

            // Subtle float
            child.position.y += Math.sin(time * 0.8 + i * 1.2) * 0.04 * eased;
            child.rotation.y =
                Math.sin(time * 0.4 + i * 0.7) * 0.03 * eased;
            child.rotation.x =
                Math.sin(time * 0.3 + i * 0.5) * 0.015 * eased;
        });
    });

    // Appearance factor for HTML labels
    const appearance = Math.max(0, (scrollProgress - 0.55) / 0.45);

    return (
        <group ref={groupRef}>
            {cards.map((card, i) => {
                const stagger = i * 0.15;
                const localProgress = Math.max(
                    0,
                    Math.min(1, (appearance - stagger) / 0.35)
                );
                const eased = 1 - Math.pow(1 - localProgress, 3);

                return (
                    <mesh
                        key={i}
                        position={card.pos}
                    >
                        <boxGeometry args={[2.0, 1.0, 0.04]} />
                        <shaderMaterial
                            vertexShader={vertexShader}
                            fragmentShader={fragmentShader}
                            uniforms={{
                                uOpacity: { value: 0 },
                                uTime: { value: 0 },
                                uBorderColor: {
                                    value: new THREE.Color(card.color),
                                },
                            }}
                            transparent
                            side={THREE.DoubleSide}
                            depthWrite={false}
                        />
                        {/* HTML label overlay */}
                        <Html
                            center
                            style={{
                                opacity: eased,
                                pointerEvents: "none",
                                userSelect: "none",
                                transition: "opacity 0.3s ease",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "2px",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "10px",
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase",
                                        color: "#94A3B8",
                                        fontFamily: "Inter, sans-serif",
                                        fontWeight: 500,
                                    }}
                                >
                                    {card.label}
                                </span>
                                <span
                                    style={{
                                        fontSize: "22px",
                                        fontWeight: 600,
                                        color: card.color,
                                        fontFamily: "Inter, sans-serif",
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {card.value}
                                </span>
                            </div>
                        </Html>
                    </mesh>
                );
            })}
        </group>
    );
}
