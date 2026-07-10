const fs = require('fs');

let code = fs.readFileSync('src/components/AstroStats.tsx', 'utf8');

code = code.replace(
  /\{\(planetData.name === 'Moon' \|\| planetData.name === 'Sun'\) && \(/g,
  `{planetData.name === 'Moon' && (`
);

fs.writeFileSync('src/components/AstroStats.tsx', code);
