const fs = require('fs');
let code = fs.readFileSync('src/components/MapGrid.tsx', 'utf8');

code = code.replace(
  /import \{ MAP_RADIUS, latLonToFlatEarth \} from '\.\.\/lib\/astronomy';/,
  `import { MAP_RADIUS, latLonToFlatEarth } from '../lib/astronomy';\nimport { IceWall } from './IceWall';`
);

code = code.replace(
  /<FlatEarthMap \/>/,
  `<FlatEarthMap />\n      <IceWall />`
);

fs.writeFileSync('src/components/MapGrid.tsx', code);

const iceWallCode = `import React from 'react';
import { Torus } from '@react-three/drei';
import { MAP_RADIUS } from '../lib/astronomy';

export function IceWall() {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
      {/* Outer Ice Wall Ring */}
      <Torus args={[MAP_RADIUS - 0.2, 0.4, 16, 100]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#e2e8f0" 
          roughness={0.2}
          metalness={0.1}
        />
      </Torus>
      {/* Inner subtle glow/ice shelf */}
      <Torus args={[MAP_RADIUS - 0.4, 0.1, 8, 100]} position={[0, 0, -0.1]}>
        <meshStandardMaterial 
          color="#bae6fd" 
          roughness={0.8}
        />
      </Torus>
    </group>
  );
}`;
fs.writeFileSync('src/components/IceWall.tsx', iceWallCode);

