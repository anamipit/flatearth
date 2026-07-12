const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// import Plane icon
code = code.replace(
  /Calendar } from 'lucide-react';/,
  `Calendar, Plane } from 'lucide-react';`
);

// Get showFlightPanel from store
code = code.replace(
  /setShowAstroEvents\n  } = useSimulation\(\);/,
  `setShowAstroEvents,\n    showFlightPanel,\n    setShowFlightPanel\n  } = useSimulation();`
);

// Add button
code = code.replace(
  /<div className="grid grid-cols-2 gap-1">/,
  `<div className="grid grid-cols-3 gap-1">`
);

const newButton = `
                <button 
                  onClick={() => setShowFlightPanel(!showFlightPanel)} 
                  className={\`w-full flex items-center justify-center gap-1.5 \${showFlightPanel ? 'bg-blue-900/40 text-blue-400 border-blue-500/50' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'} text-xs py-2 rounded-md transition-colors border\`}
                >
                  <Plane size={12} />
                  Rute
                </button>`;

code = code.replace(
  /<div className="grid grid-cols-2 gap-1">\s*<button/,
  `<div className="grid grid-cols-3 gap-1">
${newButton}
                <button`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
