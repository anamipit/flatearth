const fs = require('fs');

let code = fs.readFileSync('src/components/Planets.tsx', 'utf8');

code = code.replace(
  `import { getPlanetPosition, getGMST, getSubpoint, latLonToFlatEarth } from '../lib/astronomy';`,
  `import { getPlanetPosition, getGMST, getSubpoint, latLonToFlatEarth } from '../lib/astronomy';\nimport { AstroTime, JupiterMoons } from 'astronomy-engine';`
);

code = code.replace(
  `export function Planets() {`,
  `export function Planets() {\n  const jupiterMoonsRef = useRef<{io: THREE.Mesh | null, europa: THREE.Mesh | null, ganymede: THREE.Mesh | null, callisto: THREE.Mesh | null}>({io: null, europa: null, ganymede: null, callisto: null});`
);

const useFrameReplacement = `
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

    if (selectedPlanet === 'Jupiter') {
      try {
        const time = new AstroTime(date);
        const moons = JupiterMoons(time);
        
        // Moons return state vectors in AU. We scale them so they are visible around Jupiter.
        // Scale 1 AU to say 10 units for visual spacing
        const s = 30.0; 
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
  });`;

code = code.replace(/useFrame\(\(\) => \{.*?\}\);/s, useFrameReplacement);

const jupiterMoonsJSX = `
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
`;

code = code.replace(/\{\(hoveredPlanet === planet.name \|\| selectedPlanet === planet.name\) && \(.*?\)\}           /s, jupiterMoonsJSX);

fs.writeFileSync('src/components/Planets.tsx', code);
