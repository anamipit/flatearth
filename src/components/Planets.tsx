import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sphere, Html } from '@react-three/drei';
import { useSimulation } from '../store/useSimulation';
import { getPlanetPosition, getGMST, getSubpoint, latLonToFlatEarth } from '../lib/astronomy';

const PLANETS = [
  { name: 'Mercury', label: 'Merkurius', color: '#a3a3a3', size: 0.08 },
  { name: 'Venus', label: 'Venus', color: '#fcd34d', size: 0.12 },
  { name: 'Mars', label: 'Mars', color: '#f87171', size: 0.1 },
  { name: 'Jupiter', label: 'Yupiter', color: '#fdba74', size: 0.16 },
  { name: 'Saturn', label: 'Saturnus', color: '#fef08a', size: 0.15 },
  { name: 'Uranus', label: 'Uranus', color: '#bae6fd', size: 0.13 },
  { name: 'Neptune', label: 'Neptunus', color: '#60a5fa', size: 0.13 },
];

export function Planets() {
  const { showConstellations } = useSimulation(); // Reuse this toggle for planets? Or create a new one? We'll always show them for now.
  const planetRefs = useRef<{ [key: string]: THREE.Group | null }>({});

  useFrame(() => {
    const date = new Date(useSimulation.getState().currentTime);
    const gmst = getGMST(date);
    
    PLANETS.forEach(planet => {
      const pos = getPlanetPosition(planet.name, date);
      if (pos) {
        const sub = getSubpoint(pos.ra, pos.dec, gmst);
        const flat = latLonToFlatEarth(sub.lat, sub.lon);
        
        const ref = planetRefs.current[planet.name];
        if (ref) {
          // Place them at similar height as sun/moon or stars
          ref.position.set(flat.x, 3.5, flat.z);
        }
      }
    });
  });

  return (
    <group>
      {PLANETS.map((planet) => (
        <group 
          key={planet.name} 
          ref={(el) => (planetRefs.current[planet.name] = el)}
        >
          <Sphere args={[planet.size, 16, 16]}>
            <meshStandardMaterial color={planet.color} roughness={0.8} metalness={0.2} />
          </Sphere>
          {/* Subtle glow */}
          <Sphere args={[planet.size * 2, 16, 16]}>
            <meshBasicMaterial color={planet.color} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
          </Sphere>
          
          <Html position={[0, 0.4, 0]} center zIndexRange={[100, 0]}>
            <div className="bg-zinc-950/80 backdrop-blur text-xs px-2 py-0.5 rounded border border-zinc-800 shadow text-zinc-300 select-none whitespace-nowrap" style={{ borderColor: planet.color + '40', color: planet.color }}>
              {planet.label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
