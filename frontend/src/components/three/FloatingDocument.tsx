"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Premium floating 3D document — hospital bill visualization.
 *
 * Fixes from previous version:
 * - Base color changed from #1E293B (invisible) to lighter paper tone
 * - Line item patterns much more visible
 * - Scan beam wider and brighter with post-scan highlight
 * - Paper edge glow via enhanced fresnel
 * - Subtle vertex displacement for organic paper feel
 */
export default function FloatingDocument({
    scrollProgress = 0,
}: {
    scrollProgress?: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<THREE.ShaderMaterial>(null!);

    const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform float uScanPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      // Subtle paper curl/wave displacement
      vec3 pos = position;
      float wave = sin(pos.y * 2.0 + uTime * 0.5) * 0.02;
      float curl = sin(pos.x * 3.0 + uTime * 0.3) * 0.015;
      pos.z += wave + curl;

      // Slight bend based on scan position
      float scanInfluence = smoothstep(0.3, 0.0, abs(uv.y - uScanPosition));
      pos.z += scanInfluence * 0.08;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

    const fragmentShader = `
    uniform float uScanPosition;
    uniform float uOpacity;
    uniform float uTime;
    uniform vec3 uScanColor;
    uniform vec3 uBaseColor;
    uniform vec3 uPaperEdge;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // Paper base — noticeably lighter than page for clear visibility
      vec3 color = uBaseColor;
      // Add subtle warm paper tint
      color += vec3(0.04, 0.03, 0.02);

      // Line item patterns — mimicking bill rows
      float lineSpacing = 20.0;
      float linePattern = smoothstep(0.45, 0.5, fract(vUv.y * lineSpacing));
      float thickLine = smoothstep(0.44, 0.5, fract(vUv.y * 4.0));

      // Horizontal ruled lines — high contrast
      color = mix(color, color * 1.8, linePattern * 0.35);
      // Section dividers (thicker, brighter)
      color = mix(color, color * 2.0, thickLine * 0.25);

      // Fake text blocks (horizontal dashes) — clearly visible
      float textBlock = step(0.1, vUv.x) * step(vUv.x, 0.85);
      float textLine = smoothstep(0.48, 0.5, fract(vUv.y * lineSpacing + 0.25));
      float textWidth = smoothstep(0.0, 0.1, fract(vUv.x * 8.0 + vUv.y * 3.0));
      color = mix(color, color * 1.5, textBlock * textLine * textWidth * 0.3);

      // Top header area — simulating a medical bill header
      float headerArea = smoothstep(0.88, 0.92, vUv.y);
      color = mix(color, color * 1.6, headerArea * 0.3);

      // Dollar amounts on right side
      float amountArea = smoothstep(0.7, 0.75, vUv.x) * step(vUv.x, 0.9);
      color = mix(color, color * 1.3, amountArea * textLine * 0.2);

      // ─── Scan beam (wider, brighter) ───
      float distance = abs(vUv.y - uScanPosition);
      float beamIntensity = smoothstep(0.08, 0.0, distance);
      float glowIntensity = smoothstep(0.25, 0.0, distance) * 0.4;
      float wideGlow = smoothstep(0.4, 0.0, distance) * 0.1;

      color = mix(color, uScanColor * 2.0, beamIntensity);
      color += uScanColor * glowIntensity;
      color += uScanColor * wideGlow;

      // ─── Post-scan highlight: scanned area stays brighter ───
      float scannedRegion = smoothstep(uScanPosition + 0.05, uScanPosition - 0.1, vUv.y);
      color = mix(color, color * 1.3 + uScanColor * 0.08, scannedRegion * step(0.05, uScanPosition));

      // ─── Edge glow (fresnel rim light) ───
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
      color += uPaperEdge * fresnel * 0.6;

      // Corner vignette on the document
      float cornerDist = length((vUv - 0.5) * 2.0);
      float vignette = 1.0 - smoothstep(0.8, 1.5, cornerDist) * 0.3;
      color *= vignette;

      // Subtle pulse synchronized with scan
      float pulse = sin(uTime * 1.5) * 0.01 + 1.0;
      color *= pulse;

      gl_FragColor = vec4(color, uOpacity);
    }
  `;

    const uniforms = useMemo(
        () => ({
            uScanPosition: { value: -0.1 },
            uOpacity: { value: 1.0 },
            uTime: { value: 0 },
            uScanColor: { value: new THREE.Color("#000000") }, // Neon Cyan
            // Premium Void — deep tech navy instead of paper white
            uBaseColor: { value: new THREE.Color("#0B0E14") },
            uPaperEdge: { value: new THREE.Color("#000000") }, // Cyan Edge Glow
        }),
        []
    );

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current) return;

        const time = state.clock.getElapsedTime();
        materialRef.current.uniforms.uTime.value = time;

        // Scan line moves with scroll
        materialRef.current.uniforms.uScanPosition.value =
            scrollProgress * 1.3 - 0.15;

        // Document fades and dissolves after scan
        const fadeStart = 0.65;
        const opacity =
            scrollProgress > fadeStart
                ? 1 - (scrollProgress - fadeStart) / (1 - fadeStart)
                : 1;
        materialRef.current.uniforms.uOpacity.value = Math.max(0, opacity);

        // Gentle floating motion
        meshRef.current.position.y = Math.sin(time * 0.6) * 0.12;
        meshRef.current.rotation.x = Math.sin(time * 0.4) * 0.04 - 0.03;
        meshRef.current.rotation.y = Math.cos(time * 0.25) * 0.05;

        // Slight rotation toward viewer as we progress
        meshRef.current.rotation.z = scrollProgress * 0.02;

        // Scale down as we progress
        const scale = 1 - scrollProgress * 0.25;
        meshRef.current.scale.setScalar(Math.max(0.4, scale));
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <planeGeometry args={[3.2, 4.2, 32, 32]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}
