const fs = require('fs');

let code = fs.readFileSync('src/components/CelestialBodies.tsx', 'utf8');

// Fix pointer events for Html
code = code.replace(
  /<Html position={\[0, 1.2, 0\]} center zIndexRange={\[100, 0\]}>/g,
  `<Html position={[0, 1.2, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>`
);

// Reduce Penumbra size
code = code.replace(
  /let R_penumbra = R_moon \+ \(R_sun \+ R_moon\) \* \(distMoonGroundRay \/ distSunMoon\);/,
  `let R_penumbra = R_moon + ((R_sun + R_moon) * 0.2) * (distMoonGroundRay / distSunMoon);`
);

fs.writeFileSync('src/components/CelestialBodies.tsx', code);
