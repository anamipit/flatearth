const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  /<div className="grid grid-cols-2 gap-1">\s*<button \n                  onClick=\{.*?setFlatTerminator.*?Sorotan Flat/s,
  `<div className="grid grid-cols-2 gap-1">\n                <button \n                  onClick={() => setFlatTerminator(!flatTerminator)}`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
