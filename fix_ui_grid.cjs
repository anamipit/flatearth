const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  /<div className="grid grid-cols-2 gap-1">/,
  `<div className="grid grid-cols-3 gap-1">`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
