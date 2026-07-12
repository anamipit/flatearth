const fs = require('fs');

let code = fs.readFileSync('src/components/FlightRoute3D.tsx', 'utf8');

code = code.replace(
  `  const materialRef = useRef<THREE.LineBasicMaterial>(null);`,
  `  const lineRef = useRef<any>(null);`
);

code = code.replace(
  `    if (materialRef.current) {\n      // Dash animation\n      materialRef.current.dashOffset -= 0.01;\n    }`,
  `    if (lineRef.current && lineRef.current.material) {\n      lineRef.current.material.dashOffset -= 0.01;\n    }`
);

code = code.replace(
  /<lineDashedMaterial ref=\{materialRef\} attach="material" color="\#3b82f6" dashSize=\{0\.2\} gapSize=\{0\.1\} \/>/,
  ``
);

code = code.replace(
  /<Line\n        points=\{points\}/,
  `<Line\n        ref={lineRef}\n        points={points}`
);

fs.writeFileSync('src/components/FlightRoute3D.tsx', code);
