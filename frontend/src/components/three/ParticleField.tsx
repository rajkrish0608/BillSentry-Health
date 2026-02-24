"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Floating particle field that represents chaotic billing data.
 * Particles drift aimlessly in Scene 1, then snap into grid formation
 * when the scroll progress passes the transformation threshold.
 */
export default function ParticleField({
    count = 800,
    scrollProgress = 0,
}: {
    count?: number;
    scrollProgress?: number;
}) {
    const meshRef = useRef<THREE.Points>(null!);
    const materialRef = useRef<THREE.ShaderMaterial>(null!);

    const { randomPositions, gridPositions } = useMemo(() => {
        const random = new Float32Array(count * 3);
        const grid = new Float32Array(count * 3);
        const cols = Math.ceil(Math.sqrt(count));

        for (let i = 0; i < count; i++) {
            random[i * 3] = (Math.random() - 0.5) * 12;
            random[i * 3 + 1] = (Math.random() - 0.5) * 8;
            random[i * 3 + 2] = (Math.random() - 0.5) * 6;

            const row = Math.floor(i / cols);
            const col = i % cols;
            grid[i * 3] = (col / cols - 0.5) * 8;
            grid[i * 3 + 1] = (row / cols - 0.5) * 5;
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
            sizes[i] = Math.random() * 2 + 0.5;
        }

        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
        return geo;
    }, [count, randomPositions]);

    const vertexShader = `
    attribute float size;
    varying float vAlpha;
    uniform float uProgress;
    uniform float uTime;

    void main() {
      vec3 pos = position;
      float drift = sin(uTime * 0.5 + pos.x * 2.0) * 0.15 * (1.0 - uProgress);
      pos.y += drift;
      pos.x += cos(uTime * 0.3 + pos.y * 1.5) * 0.1 * (1.0 - uProgress);

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (200.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      vAlpha = smoothstep(12.0, 2.0, -mvPosition.z) * (0.4 + 0.6 * uProgress);
    }
  `;

    const fragmentShader = `
    varying float vAlpha;
    uniform float uProgress;
    uniform vec3 uColorChaos;
    uniform vec3 uColorOrder;

    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float softEdge = 1.0 - smoothstep(0.3, 0.5, dist);
      vec3 color = mix(uColorChaos, uColorOrder, uProgress);
      gl_FragColor = vec4(color, softEdge * vAlpha);
    }
  `;

    const uniforms = useMemo(
        () => ({
            uProgress: { value: 0 },
            uTime: { value: 0 },
            uColorChaos: { value: new THREE.Color("#94A3B8") },
            uColorOrder: { value: new THREE.Color("#10B981") },
        }),
        []
    );

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current) return;

        const time = state.clock.getElapsedTime();
        materialRef.current.uniforms.uTime.value = time;
        materialRef.current.uniforms.uProgress.value = scrollProgress;

        const positions = meshRef.current.geometry.attributes.position
            .array as Float32Array;
        for (let i = 0; i < count * 3; i++) {
            positions[i] = THREE.MathUtils.lerp(
                randomPositions[i],
                gridPositions[i],
                scrollProgress
            );
        }
        meshRef.current.geometry.attributes.position.needsUpdate = true;
        meshRef.current.rotation.y = time * 0.02 * (1 - scrollProgress * 0.8);
    });

    return (
        <points ref={meshRef} geometry={geometry}>
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
    );
}
