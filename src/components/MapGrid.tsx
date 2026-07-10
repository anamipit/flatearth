import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Ring, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MAP_RADIUS, latLonToFlatEarth } from '../lib/astronomy';
import { FlatEarthMap } from './FlatEarthMap';

export function MapGrid() {
  const numRings = 6;
  const numRadials = 24;

  const eqRadius = latLonToFlatEarth(0, 0).r;
  const cancerRadius = latLonToFlatEarth(23.439, 0).r;
  const capricornRadius = latLonToFlatEarth(-23.439, 0).r;

  return (
    <group>
      {/* Base Shader Map */}
      <FlatEarthMap />

      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Grid Lines */}
        {Array.from({ length: numRings }).map((_, i) => {
          const radius = (MAP_RADIUS / numRings) * (i + 1);
          return (
            <Ring key={`ring-${i}`} args={[radius - 0.02, radius + 0.02, 64]} position={[0, 0, 0]}>
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
            </Ring>
          );
        })}

        {Array.from({ length: numRadials }).map((_, i) => {
          const angle = (i * Math.PI * 2) / numRadials;
          const x = Math.cos(angle) * MAP_RADIUS;
          const y = Math.sin(angle) * MAP_RADIUS;
          return (
            <Line
              key={`radial-${i}`}
              points={[[0, 0, 0], [x, y, 0]]}
              color="#3b82f6"
              transparent
              opacity={0.15}
              lineWidth={1}
            />
          );
        })}

        {/* Tropic of Cancer */}
        <Ring args={[cancerRadius - 0.05, cancerRadius + 0.05, 128]}>
          <meshBasicMaterial color="#fca5a5" transparent opacity={0.4} />
        </Ring>
        
        {/* Equator */}
        <Ring args={[eqRadius - 0.05, eqRadius + 0.05, 128]}>
          <meshBasicMaterial color="#fcd34d" transparent opacity={0.4} />
        </Ring>

        {/* Tropic of Capricorn */}
        <Ring args={[capricornRadius - 0.05, capricornRadius + 0.05, 128]}>
          <meshBasicMaterial color="#6ee7b7" transparent opacity={0.4} />
        </Ring>

        {/* Axis Labels */}
        <Text position={[0, -(MAP_RADIUS + 0.5), 0]} fontSize={0.8} color="#94a3b8" anchorX="center" anchorY="middle">0° / 12h</Text>
        <Text position={[0, MAP_RADIUS + 0.5, 0]} fontSize={0.8} color="#94a3b8" anchorX="center" anchorY="middle">180° / 0h</Text>
        <Text position={[MAP_RADIUS + 0.5, 0, 0]} fontSize={0.8} color="#94a3b8" anchorX="center" anchorY="middle">90°E</Text>
        <Text position={[-(MAP_RADIUS + 0.5), 0, 0]} fontSize={0.8} color="#94a3b8" anchorX="center" anchorY="middle">90°W</Text>
        
        <Text position={[cancerRadius, 0, 0.2]} fontSize={0.3} color="#fca5a5" opacity={0.8}>Cancer</Text>
        <Text position={[eqRadius, 0, 0.2]} fontSize={0.3} color="#fcd34d" opacity={0.8}>Equator</Text>
        <Text position={[capricornRadius, 0, 0.2]} fontSize={0.3} color="#6ee7b7" opacity={0.8}>Capricorn</Text>
      </group>
    </group>
  );
}
