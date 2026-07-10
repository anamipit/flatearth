const fs = require('fs');

let code = fs.readFileSync('src/components/Planets.tsx', 'utf8');

code = code.replace(
  /<Html position={\[0, 0.4, 0\]} center zIndexRange={\[100, 0\]}>/g,
  `<Html position={[0, 0.4, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>`
);

fs.writeFileSync('src/components/Planets.tsx', code);
