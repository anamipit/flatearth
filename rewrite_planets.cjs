const fs = require('fs');

const code = `import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sphere, Html } from '@react-three/drei';
import { useSimulation } from '../store/useSimulation';
import { getPlanetPosition, getGMST, getSubpoint, latLonToFlatEarth } from '../lib/astronomy';
import { AstroTime, JupiterMoons } from 'astronomy-engine';

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
  const jupiterMoonsRef = useRef<{io: THREE.Mesh | null, europa: THREE.Mesh | null, ganymede: THREE.Mesh | null, callisto: THREE.Mesh | null}>({io: null, europa: null, ganymede: null, callisto: null});
  const { showConstellations, selectedPlanet, setSelectedPlanet } = useSimulation();
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

    if (useSimulation.getState().selectedPlanet === 'Jupiter') {
      try {
        const time = new AstroTime(date);
        const moons = JupiterMoons(time);
        
        // Moons return state vectors in AU. We scale them so they are visible around Jupiter.
        // Scale 1 AU to say 10 units for visual spacing
        const s = 15.0; 
        if (jupiterMoonsRef.current.io) {
          jupiterMoonsRef.current.io.position.set(moons.io.x * s, moons.io.y * s, moons.io.z * s);
        }
        if (jupiterMoonsRef.current.europa) {
          jupiterMoonsRef.current.europa.position.set(moons.europa.x * s, moons.europa.y * s, moons.europa.z * s);
        }
        if (jupiterMoonsRef.current.ganymede) {
          jupiterMoonsRef.current.ganymede.position.set(moons.ganymede.x * s, moons.ganymede.y * s, moons.ganymede.z * s);
        }
        if (jupiterMoonsRef.current.callisto) {
          jupiterMoonsRef.current.callisto.position.set(moons.callisto.x * s, moons.callisto.y * s, moons.callisto.z * s);
        }
      } catch(e) {}
    }
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

          {planet.name === 'Jupiter' && selectedPlanet === 'Jupiter' && (
            <group>
              <mesh ref={(el) => jupiterMoonsRef.current.io = el}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color="#eab308" />
                <Html position={[0, 0.1, 0]} center zIndexRange={[100, 0]}><div className="text-[8px] text-yellow-500 bg-zinc-950/80 px-1 rounded font-mono">Io</div></Html>
              </mesh>
              <mesh ref={(el) => jupiterMoonsRef.current.europa = el}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color="#d1d5db" />
                <Html position={[0, 0.1, 0]} center zIndexRange={[100, 0]}><div className="text-[8px] text-zinc-300 bg-zinc-950/80 px-1 rounded font-mono">Eu</div></Html>
              </mesh>
              <mesh ref={(el) => jupiterMoonsRef.current.ganymede = el}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#9ca3af" />
                <Html position={[0, 0.1, 0]} center zIndexRange={[100, 0]}><div className="text-[8px] text-zinc-400 bg-zinc-950/80 px-1 rounded font-mono">Ga</div></Html>
              </mesh>
              <mesh ref={(el) => jupiterMoonsRef.current.callisto = el}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#6b7280" />
                <Html position={[0, 0.1, 0]} center zIndexRange={[100, 0]}><div className="text-[8px] text-zinc-500 bg-zinc-950/80 px-1 rounded font-mono">Ca</div></Html>
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}
`;

fs.writeFileSync('src/components/Planets.tsx', code);
