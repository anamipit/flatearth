const fs = require('fs');
let code = fs.readFileSync('src/components/CelestialBodies.tsx', 'utf8');

code = code.replace(
  `import { Sphere } from '@react-three/drei';`,
  `import { Sphere, Html } from '@react-three/drei';\nimport { useState } from 'react';`
);

code = code.replace(
  `const { currentTime, advanceTime, sunScale, moonScale, sunHeight, moonHeight } = useSimulation();`,
  `const { currentTime, advanceTime, sunScale, moonScale, sunHeight, moonHeight, selectedPlanet, setSelectedPlanet } = useSimulation();\n  const [hoveredBody, setHoveredBody] = useState<string | null>(null);`
);

const sunReplacement = `{/* Sun */}
      <group 
        ref={sunRef} 
        scale={[sunScale, sunScale, sunScale]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPlanet(selectedPlanet === 'Sun' ? null : 'Sun');
        }}
        onPointerEnter={(e) => { e.stopPropagation(); setHoveredBody('Sun'); }}
        onPointerLeave={(e) => { e.stopPropagation(); setHoveredBody(null); }}
      >
        <Sphere args={[0.2, 32, 32]}>
          <meshBasicMaterial color="#fef08a" />
        </Sphere>
        {selectedPlanet === 'Sun' && (
          <Sphere args={[0.25, 32, 32]}>
            <meshBasicMaterial color="#fef08a" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
          </Sphere>
        )}
        {/* Sun light illuminating the Moon and Earth */}
        <pointLight color="#ffffff" intensity={3} distance={150} decay={0} />
        {/* Glow effect */}
        <Sphere args={[0.5, 32, 32]}>
          <meshBasicMaterial color="#fde047" transparent opacity={selectedPlanet === 'Sun' ? 0.4 : 0.25} blending={THREE.AdditiveBlending} />
        </Sphere>
        
        {/* Hitbox */}
        <Sphere args={[0.8, 16, 16]}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </Sphere>
        
        {(hoveredBody === 'Sun' || selectedPlanet === 'Sun') && (
          <Html position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
            <div className="bg-zinc-950/90 backdrop-blur text-xs px-2 py-0.5 rounded border shadow font-medium whitespace-nowrap border-yellow-500/50 text-yellow-400">
              Matahari
            </div>
          </Html>
        )}
      </group>`;

code = code.replace(/\{\/\* Sun \*\/\}.*?<\/group>/s, sunReplacement);

const moonReplacement = `{/* Moon */}
      <group 
        ref={moonRef} 
        scale={[moonScale, moonScale, moonScale]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPlanet(selectedPlanet === 'Moon' ? null : 'Moon');
        }}
        onPointerEnter={(e) => { e.stopPropagation(); setHoveredBody('Moon'); }}
        onPointerLeave={(e) => { e.stopPropagation(); setHoveredBody(null); }}
      >
        <Sphere args={[0.18, 32, 32]}>
          <meshStandardMaterial ref={moonMatRef} color="#e2e8f0" roughness={0.9} metalness={0.1} emissive={selectedPlanet === 'Moon' ? '#3b82f6' : '#000000'} emissiveIntensity={selectedPlanet === 'Moon' ? 0.3 : 0} />
        </Sphere>
        {selectedPlanet === 'Moon' && (
          <Sphere args={[0.22, 32, 32]}>
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
          </Sphere>
        )}
        
        {/* Hitbox */}
        <Sphere args={[0.7, 16, 16]}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </Sphere>
        
        {(hoveredBody === 'Moon' || selectedPlanet === 'Moon') && (
          <Html position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
            <div className="bg-zinc-950/90 backdrop-blur text-xs px-2 py-0.5 rounded border shadow font-medium whitespace-nowrap border-indigo-500/50 text-indigo-400">
              Bulan
            </div>
          </Html>
        )}
      </group>`;
      
code = code.replace(/\{\/\* Moon \*\/\}.*?<\/group>/s, moonReplacement);

fs.writeFileSync('src/components/CelestialBodies.tsx', code);
