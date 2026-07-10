import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation } from '../store/useSimulation';
import { getGMST, getSubpoint, latLonToFlatEarth } from '../lib/astronomy';
import { Sphere, Line, Html } from '@react-three/drei';

// Major Constellations Definition with RA (hours) and Dec (degrees)
const CONSTELLATIONS = {
  UrsaMajor: {
    name: "Ursa Major (Biduk / Beruang Besar)",
    color: "#fef08a",
    stars: [
      { name: "Dubhe", ra: 11.06, dec: 61.75 },
      { name: "Merak", ra: 11.03, dec: 56.38 },
      { name: "Phecda", ra: 11.89, dec: 53.69 },
      { name: "Megrez", ra: 12.25, dec: 57.03 },
      { name: "Alioth", ra: 12.9, dec: 55.96 },
      { name: "Mizar", ra: 13.4, dec: 54.92 },
      { name: "Alkaid", ra: 13.79, dec: 49.31 }
    ],
    connections: [ [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [3, 0] ]
  },
  Cassiopeia: {
    name: "Cassiopeia (Ratu W)",
    color: "#a5f3fc",
    stars: [
      { name: "Caph", ra: 0.15, dec: 59.15 },
      { name: "Schedar", ra: 0.68, dec: 56.54 },
      { name: "Gamma Cas", ra: 0.95, dec: 60.72 },
      { name: "Ruchbah", ra: 1.43, dec: 60.23 },
      { name: "Segin", ra: 1.9, dec: 63.67 }
    ],
    connections: [ [0, 1], [1, 2], [2, 3], [3, 4] ]
  },
  Orion: {
    name: "Orion (Sang Pemburu)",
    color: "#fecdd3",
    stars: [
      { name: "Betelgeuse", ra: 5.92, dec: 7.41 },
      { name: "Bellatrix", ra: 5.42, dec: 6.35 },
      { name: "Mintaka", ra: 5.53, dec: -0.3 },
      { name: "Alnilam", ra: 5.6, dec: -1.2 },
      { name: "Alnitak", ra: 5.68, dec: -1.94 },
      { name: "Saiph", ra: 5.79, dec: -9.67 },
      { name: "Rigel", ra: 5.25, dec: -8.2 }
    ],
    connections: [ [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 2], [4, 0] ]
  },
  Crux: {
    name: "Crux (Gubuk Pari)",
    color: "#fed7aa",
    stars: [
      { name: "Acrux", ra: 12.44, dec: -63.1 },
      { name: "Mimosa", ra: 12.79, dec: -59.68 },
      { name: "Gacrux", ra: 12.52, dec: -57.11 },
      { name: "Imai", ra: 12.25, dec: -58.75 }
    ],
    connections: [ [0, 2], [1, 3] ]
  },
  Scorpius: {
    name: "Scorpius (Kalajengking)",
    color: "#fca5a5",
    stars: [
      { name: "Antares", ra: 16.49, dec: -26.43 },
      { name: "Graffias", ra: 16.08, dec: -19.8 },
      { name: "Dschubba", ra: 16.0, dec: -22.62 },
      { name: "Sargas", ra: 17.62, dec: -43.0 },
      { name: "Shaula", ra: 17.56, dec: -37.1 }
    ],
    connections: [ [1, 2], [2, 0], [0, 3], [3, 4] ]
  },
  CanisMajor: {
    name: "Canis Major (Anjing Besar - Sirius)",
    color: "#bfdbfe",
    stars: [
      { name: "Sirius", ra: 6.75, dec: -16.71 },
      { name: "Murzim", ra: 6.37, dec: -22.51 },
      { name: "Adhara", ra: 6.97, dec: -28.97 },
      { name: "Wezen", ra: 7.14, dec: -26.39 },
      { name: "Aludra", ra: 7.4, dec: -29.3 }
    ],
    connections: [ [0, 1], [0, 3], [3, 2], [3, 4] ]
  },
  Taurus: {
    name: "Taurus (Banteng)",
    color: "#fde047",
    stars: [
      { name: "Aldebaran", ra: 4.59, dec: 16.5 },
      { name: "Elnath", ra: 5.43, dec: 28.6 },
      { name: "Alheka", ra: 5.62, dec: 21.14 },
      { name: "Hyadum I", ra: 4.33, dec: 15.62 },
      { name: "Ain", ra: 4.47, dec: 19.18 }
    ],
    connections: [ [0, 3], [3, 4], [0, 4], [0, 2], [4, 1] ]
  },
  Cygnus: {
    name: "Cygnus (Angsa)",
    color: "#e2e8f0",
    stars: [
      { name: "Deneb", ra: 20.69, dec: 45.28 },
      { name: "Sadr", ra: 20.37, dec: 40.25 },
      { name: "Gienah", ra: 20.77, dec: 33.96 },
      { name: "Fawaris", ra: 19.74, dec: 45.13 },
      { name: "Albireo", ra: 19.51, dec: 27.95 }
    ],
    connections: [ [0, 1], [1, 2], [1, 3], [1, 4] ]
  }
};

const POLARIS = { name: "Polaris (Bintang Utara)", ra: 2.53, dec: 89.26, color: "#fef08a" };

const STAR_HEIGHT = 12.0; // Place well above Sun/Moon (3.0)

export function Constellations() {
  const { showConstellations } = useSimulation();
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredConstell, setHoveredConstell] = useState<string | null>(null);

  // Compute static flat Earth positions (for GMST = 0, i.e., lon = RA * 15)
  const { staticPolaris, staticConstellations } = useMemo(() => {
    const polarisSub = getSubpoint(POLARIS.ra * 15, POLARIS.dec, 0);
    const polarisFlat = latLonToFlatEarth(polarisSub.lat, polarisSub.lon);
    
    const constells = Object.entries(CONSTELLATIONS).map(([key, constell]) => {
      let sumX = 0, sumZ = 0;
      const starsFlat = constell.stars.map((star) => {
        const starSub = getSubpoint(star.ra * 15, star.dec, 0);
        const starFlat = latLonToFlatEarth(starSub.lat, starSub.lon);
        sumX += starFlat.x;
        sumZ += starFlat.z;
        return new THREE.Vector3(starFlat.x, STAR_HEIGHT, starFlat.z);
      });

      return {
        key,
        name: constell.name,
        color: constell.color,
        stars: starsFlat,
        connections: constell.connections,
        center: new THREE.Vector3(sumX / starsFlat.length, STAR_HEIGHT, sumZ / starsFlat.length)
      };
    });

    return {
      staticPolaris: { pos: new THREE.Vector3(polarisFlat.x, STAR_HEIGHT, polarisFlat.z), name: POLARIS.name, color: POLARIS.color },
      staticConstellations: constells
    };
  }, []);

  useFrame(() => {
    if (!showConstellations || !groupRef.current) return;
    const date = new Date(useSimulation.getState().currentTime);
    const gmst = getGMST(date);
    // Rotate the entire dome around the Y-axis (negative of GMST in radians)
    groupRef.current.rotation.y = -gmst * (Math.PI / 180);
  });

  if (!showConstellations) return null;

  return (
    <group ref={groupRef}>
      {/* Polaris (Bintang Utara) */}
      <group 
        position={staticPolaris.pos}
        onPointerEnter={(e) => { e.stopPropagation(); setHoveredConstell("polaris"); }}
        onPointerLeave={(e) => { e.stopPropagation(); setHoveredConstell(null); }}
      >
        <Sphere args={[0.12, 16, 16]}>
          <meshBasicMaterial color={staticPolaris.color} />
        </Sphere>
        <Sphere args={[0.5, 16, 16]}>
          <meshBasicMaterial color={staticPolaris.color} transparent opacity={0.0} />
        </Sphere>
        <Sphere args={[0.3, 16, 16]}>
          <meshBasicMaterial color={staticPolaris.color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </Sphere>
        {hoveredConstell === "polaris" && (
          <Html position={[0, 0.5, 0]} center>
            <div className="bg-zinc-950/90 text-yellow-300 text-xs px-3 py-1.5 rounded-full border border-yellow-500/30 whitespace-nowrap shadow-[0_0_15px_rgba(250,204,21,0.2)] font-medium">
              {staticPolaris.name}
            </div>
          </Html>
        )}
      </group>

      {/* Render each constellation */}
      {staticConstellations.map((constell) => {
        const isHovered = hoveredConstell === constell.key;
        return (
          <group 
            key={constell.key}
            onPointerEnter={(e) => { e.stopPropagation(); setHoveredConstell(constell.key); }}
            onPointerLeave={(e) => { e.stopPropagation(); setHoveredConstell(null); }}
          >
            {/* Invisible Hitbox Sphere roughly at the center to make hovering easier */}
            <mesh position={constell.center}>
              <sphereGeometry args={[1.5, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {isHovered && (
              <Html position={constell.center} center>
                <div className="bg-zinc-950/90 text-white text-xs px-3 py-1.5 rounded-full border border-zinc-700 whitespace-nowrap shadow-xl font-medium" style={{ color: constell.color, borderColor: constell.color }}>
                  {constell.name}
                </div>
              </Html>
            )}

            {/* Stars */}
            {constell.stars.map((pos, idx) => (
              <group key={idx} position={pos}>
                <Sphere args={[isHovered ? 0.1 : 0.07, 16, 16]}>
                  <meshBasicMaterial color={constell.color} />
                </Sphere>
                {/* Star subtle glow */}
                <Sphere args={[isHovered ? 0.3 : 0.18, 16, 16]}>
                  <meshBasicMaterial color={constell.color} transparent opacity={isHovered ? 0.25 : 0.15} blending={THREE.AdditiveBlending} />
                </Sphere>
              </group>
            ))}

            {/* Connection Lines */}
            {constell.connections.map(([fromIdx, toIdx], lineIdx) => {
              const start = constell.stars[fromIdx];
              const end = constell.stars[toIdx];
              return (
                <Line
                  key={lineIdx}
                  points={[start, end]}
                  color={constell.color}
                  lineWidth={isHovered ? 2 : 1}
                  transparent
                  opacity={isHovered ? 0.6 : 0.35}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
