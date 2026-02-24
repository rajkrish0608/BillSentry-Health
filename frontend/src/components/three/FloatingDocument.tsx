"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A floating 3D document mesh representing a hospital bill.
 * A scan-line sweeps across it based on scroll progress,
 * using a custom GLSL fragment shader for the emerald glow effect.
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

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const fragmentShader = `
    uniform float uScanPosition;
    uniform float uOpacity;
    uniform float uTime;
    uniform vec3 uScanColor;
    uniform vec3 uBaseColor;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Base document appearance
      vec3 color = uBaseColor;

      // Fake line items on the bill
      float linePattern = step(0.48, fract(vUv.y * 16.0));
      color = mix(color, color * 1.15, linePattern * 0.3);

      // Scan line with glow
      float distance = abs(vUv.y - uScanPosition);
      float beamIntensity = smoothstep(0.06, 0.0, distance);
      float glowIntensity = smoothstep(0.2, 0.0, distance) * 0.3;

      // Emerald scan beam
      color = mix(color, uScanColor, beamIntensity);
      color += uScanColor * glowIntensity;

      // Edge lighting for depth
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      color += vec3(0.15, 0.25, 0.35) * fresnel * 0.5;

      // Subtle pulse
      float pulse = sin(uTime * 2.0) * 0.02 + 1.0;
      color *= pulse;

      gl_FragColor = vec4(color, uOpacity);
    }
  `;

    const uniforms = useMemo(
        () => ({
            uScanPosition: { value: -0.1 },
            uOpacity: { value: 1.0 },
            uTime: { value: 0 },
            uScanColor: { value: new THREE.Color("#10B981") },
            uBaseColor: { value: new THREE.Color("#1E293B") },
        }),
        []
    );

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current) return;

        const time = state.clock.getElapsedTime();
        materialRef.current.uniforms.uTime.value = time;

        // Scan line moves with scroll
        materialRef.current.uniforms.uScanPosition.value =
            scrollProgress * 1.2 - 0.1;

        // Document fades and dissolves after scan
        const fadeStart = 0.65;
        const opacity =
            scrollProgress > fadeStart
                ? 1 - (scrollProgress - fadeStart) / (1 - fadeStart)
                : 1;
        materialRef.current.uniforms.uOpacity.value = Math.max(0, opacity);

        // Gentle floating motion
        meshRef.current.position.y = Math.sin(time * 0.8) * 0.1;
        meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.03 - 0.05;
        meshRef.current.rotation.y = Math.cos(time * 0.3) * 0.04;

        // Scale down as we progress
        const scale = 1 - scrollProgress * 0.3;
        meshRef.current.scale.setScalar(Math.max(0.3, scale));
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
