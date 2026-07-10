import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';

export function Shadow() {
  const uniforms = useMemo(() => ({
    umbraRatio: { value: 0.4 },
    opacity: { value: 0.7 }
  }), []);

  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial 
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float umbraRatio;
          uniform float opacity;
          varying vec2 vUv;
          void main() {
            float dist = distance(vUv, vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = 1.0;
            if (dist > 0.5 * umbraRatio) {
              alpha = 1.0 - smoothstep(0.5 * umbraRatio, 0.5, dist);
            }
            gl_FragColor = vec4(0.0, 0.0, 0.0, alpha * opacity);
          }
        `}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}
