"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Premium particle field — data-network aesthetic.
 * Particles are crisp, small dots (not bokeh) that drift chaotically
 * in Scene 1, then snap into a clean grid in Scene 3.
 *
 * Key fixes from previous version:
 * - Point size reduced from 200 → 60 for crisp dots
 * - Soft-edge sharpened: smoothstep(0.42, 0.5) — dots not circles
 * - Depth-layered particles at varied z for parallax
 * - Connecting lines between nearby particles
 */
export default function ParticleField({
    count = 1200,
    scrollProgress = 0,
}: {
    count?: number;
    scrollProgress?: number;
}) {
    const pointsRef = useRef<THREE.Points>(null!);
    const materialRef = useRef<THREE.ShaderMaterial>(null!);
    const linesRef = useRef<THREE.LineSegments>(null!);
    const lineMatRef = useRef<THREE.ShaderMaterial>(null!);

    const { randomPositions, gridPositions } = useMemo(() => {
        const random = new Float32Array(count * 3);
        const grid = new Float32Array(count * 3);
        const cols = Math.ceil(Math.sqrt(count));

        for (let i = 0; i < count; i++) {
            // Spread particles wider and deeper for immersive feel
            random[i * 3] = (Math.random() - 0.5) * 16;
            random[i * 3 + 1] = (Math.random() - 0.5) * 10;
            random[i * 3 + 2] = (Math.random() - 0.5) * 8;

            const row = Math.floor(i / cols);
            const col = i % cols;
            grid[i * 3] = (col / cols - 0.5) * 10;
            grid[i * 3 + 1] = (row / cols - 0.5) * 6;
            grid[i * 3 + 2] = 0;
        }
        return { randomPositions: random, gridPositions: grid };
    }, [count]);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = randomPositions[i * 3];
            positions[i * 3 + 1] = randomPositions[i * 3 + 1];
            positions[i * 3 + 2] = randomPositions[i * 3 + 2];
            sizes[i] = Math.random() * 1.5 + 0.3;
        }

        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
        return geo;
    }, [count, randomPositions]);

    // Connection lines geometry (for data-network look)
    const lineGeometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        // Pre-allocate for max possible connections
        const maxLines = 400;
        const linePositions = new Float32Array(maxLines * 6);
        geo.setAttribute(
            "position",
            new THREE.BufferAttribute(linePositions, 3)
        );
        geo.setDrawRange(0, 0);
        return geo;
    }, []);

    const vertexShader = `
    attribute float size;
    varying float vAlpha;
    varying float vDepth;
    uniform float uProgress;
    uniform float uTime;

    void main() {
      vec3 pos = position;

      // Gentle organic drift (reduced in ordered state)
      float chaos = 1.0 - uProgress;
      pos.y += sin(uTime * 0.4 + pos.x * 1.5) * 0.12 * chaos;
      pos.x += cos(uTime * 0.3 + pos.y * 1.2) * 0.08 * chaos;
      pos.z += sin(uTime * 0.2 + pos.z * 0.8) * 0.06 * chaos;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

      // CRISP small dots — key fix from 200 → 60
      gl_PointSize = size * (60.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;

      // Depth-based alpha for parallax feel
      float depthFade = smoothstep(16.0, 2.0, -mvPosition.z);
      vAlpha = depthFade * (0.3 + 0.7 * uProgress);
      vDepth = -mvPosition.z;
    }
  `;

    const fragmentShader = `
    varying float vAlpha;
    varying float vDepth;
    uniform float uProgress;
    uniform vec3 uColorChaos;
    uniform vec3 uColorOrder;

    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));

      // SHARP discard — dots not bokeh
      if (dist > 0.5) discard;
      float sharpEdge = 1.0 - smoothstep(0.35, 0.5, dist);

      // Core glow for nearby particles
      float coreGlow = smoothstep(0.3, 0.0, dist) * 0.3;

      vec3 color = mix(uColorChaos, uColorOrder, uProgress);

      // Add subtle brightness variation
      color += coreGlow * vec3(0.2, 0.4, 0.3);

      gl_FragColor = vec4(color, sharpEdge * vAlpha);
    }
  `;

    const uniforms = useMemo(
        () => ({
            uProgress: { value: 0 },
            uTime: { value: 0 },
            uColorChaos: { value: new THREE.Color("#000000") }, // Neon Cyan
            uColorOrder: { value: new THREE.Color("#111827") }, // Neon Mint
        }),
        []
    );

    const lineVertexShader = `
    varying float vLineAlpha;
    uniform float uLineAlpha;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vLineAlpha = uLineAlpha;
    }
  `;

    const lineFragmentShader = `
    varying float vLineAlpha;
    uniform vec3 uLineColor;
    void main() {
      gl_FragColor = vec4(uLineColor, vLineAlpha * 0.15);
    }
  `;

    const lineUniforms = useMemo(
        () => ({
            uLineAlpha: { value: 0 },
            uLineColor: { value: new THREE.Color("#111827") }, // Neon Mint
        }),
        []
    );

    useFrame((state) => {
        if (!pointsRef.current || !materialRef.current) return;

        const time = state.clock.getElapsedTime();
        materialRef.current.uniforms.uTime.value = time;
        materialRef.current.uniforms.uProgress.value = scrollProgress;

        // Interpolate particle positions
        const positions = pointsRef.current.geometry.attributes.position
            .array as Float32Array;
        for (let i = 0; i < count * 3; i++) {
            positions[i] = THREE.MathUtils.lerp(
                randomPositions[i],
                gridPositions[i],
                scrollProgress
            );
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        // Slow rotation that reduces with order
        pointsRef.current.rotation.y =
            time * 0.015 * (1 - scrollProgress * 0.9);

        // Update connection lines
        if (linesRef.current && lineMatRef.current) {
            lineMatRef.current.uniforms.uLineAlpha.value =
                0.3 + scrollProgress * 0.7;

            const linePositions = linesRef.current.geometry.attributes.position
                .array as Float32Array;
            let lineIdx = 0;
            const maxDist = 1.5 - scrollProgress * 0.5; // Tighter connections when ordered
            const maxLines = 400;

            // Sample a subset for performance
            const step = Math.max(1, Math.floor(count / 200));

            for (let i = 0; i < count && lineIdx < maxLines * 6; i += step) {
                for (
                    let j = i + step;
                    j < count && lineIdx < maxLines * 6;
                    j += step
                ) {
                    const dx = positions[i * 3] - positions[j * 3];
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < maxDist) {
                        linePositions[lineIdx++] = positions[i * 3];
                        linePositions[lineIdx++] = positions[i * 3 + 1];
                        linePositions[lineIdx++] = positions[i * 3 + 2];
                        linePositions[lineIdx++] = positions[j * 3];
                        linePositions[lineIdx++] = positions[j * 3 + 1];
                        linePositions[lineIdx++] = positions[j * 3 + 2];
                    }
                }
            }

            linesRef.current.geometry.attributes.position.needsUpdate = true;
            linesRef.current.geometry.setDrawRange(0, lineIdx / 3);
        }
    });

    return (
        <>
            <points ref={pointsRef} geometry={geometry}>
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
            <lineSegments ref={linesRef} geometry={lineGeometry}>
                <shaderMaterial
                    ref={lineMatRef}
                    vertexShader={lineVertexShader}
                    fragmentShader={lineFragmentShader}
                    uniforms={lineUniforms}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>
        </>
    );
}
