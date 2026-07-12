const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /import \{ AstroStats \} from '\.\/components\/AstroStats';/,
  `import { AstroStats } from './components/AstroStats';\nimport { FlightRoutePanel } from './components/FlightRoutePanel';\nimport { FlightRoute3D } from './components/FlightRoute3D';`
);

code = code.replace(
  /<AstroStats \/>/,
  `<AstroStats />\n      <FlightRoutePanel />`
);

code = code.replace(
  /<LocationPin \/>/,
  `<LocationPin />\n          <FlightRoute3D />`
);

fs.writeFileSync('src/App.tsx', code);
