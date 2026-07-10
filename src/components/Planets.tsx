import React, { useRef, useState } from 'react';
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
  const { showConstellations, selectedPlanet, setSelectedPlanet } = useSimulation(); // Reuse this toggle for planets? Or create a new one? We'll always show them for now.
  const planetRefs = useRef<{ [key: string]: THREE.Group | null }>({});
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

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
          // Place them slightly higher than constellations (12.0)
          ref.position.set(flat.x, 12.5, flat.z);
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
          onPointerEnter={(e) => { e.stopPropagation(); setHoveredPlanet(planet.name); }}
          onPointerLeave={(e) => { e.stopPropagation(); setHoveredPlanet(null); }}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedPlanet === planet.name) {
              setSelectedPlanet(null);
            } else {
              setSelectedPlanet(planet.name);
            }
          }}
        >
          <Sphere args={[planet.size, 16, 16]}>
            <meshStandardMaterial color={planet.color} roughness={0.8} metalness={0.2} emissive={selectedPlanet === planet.name ? planet.color : '#000000'} emissiveIntensity={selectedPlanet === planet.name ? 0.5 : 0} />
          </Sphere>
          {/* Subtle glow */}
          <Sphere args={[planet.size * 2, 16, 16]}>
            <meshBasicMaterial color={planet.color} transparent opacity={selectedPlanet === planet.name ? 0.6 : 0.3} blending={THREE.AdditiveBlending} />
          </Sphere>
          
          {/* Invisible larger hitbox for easier hovering */}
          <Sphere args={[0.5, 16, 16]}>
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </Sphere>
          
          {(hoveredPlanet === planet.name || selectedPlanet === planet.name) && (
            <Html position={[0, 0.4, 0]} center zIndexRange={[100, 0]}>
              <div className="bg-zinc-950/90 backdrop-blur text-xs px-2 py-0.5 rounded border shadow font-medium whitespace-nowrap" style={{ borderColor: planet.color + '80', color: planet.color }}>
                {planet.label}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
