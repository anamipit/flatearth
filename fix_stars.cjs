const fs = require('fs');

const uiCode = `import React from 'react';
import { Compass, X } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';

export function StarTrailPanel() {
  const { showStarTrail, setShowStarTrail, targetLocation } = useSimulation();

  if (!showStarTrail) return null;

  return (
    <div className="absolute top-4 right-1/2 translate-x-[40%] z-20 w-64 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-2xl font-sans">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[11px] font-medium text-zinc-100 flex items-center gap-1.5">
          <Compass size={12} className="text-yellow-400" />
          Rotasi Bintang
        </h2>
        <button onClick={() => setShowStarTrail(false)} className="text-zinc-500 hover:text-white transition-colors">
          <X size={12} />
        </button>
      </div>

      <div className="text-[9px] text-zinc-400 mb-2 leading-relaxed">
        Di bumi bulat, pengamat di selatan melihat bintang mengelilingi Sigma Octantis, 
        sedangkan di utara mengelilingi Polaris.
      </div>
      
      <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
        <div className="text-[9px] font-medium text-zinc-300 border-b border-zinc-800/50 pb-1 mb-1">
          Pada Flat Earth
        </div>
        <div className="text-[9px] text-zinc-400 leading-relaxed">
          Semua bintang berada di dalam satu kubah (Dome) yang berputar berpusat di Kutub Utara (Polaris).
        </div>
      </div>
      
      <div className="mt-2 text-[9px] text-zinc-500 bg-zinc-900/30 p-2 rounded border border-zinc-800/30">
        💡 <strong>Coba ini:</strong> {targetLocation ? \`Posisi saat ini di \${targetLocation.name}. Coba putar kamera ke atas melihat ke langit.\` : 'Cari lokasi (contoh: Sydney, Australia), lalu putar kamera ke atas.'}
      </div>
    </div>
  );
}`;
fs.writeFileSync('src/components/StarTrailPanel.tsx', uiCode);


let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  `import { LineOfSightPanel } from './components/LineOfSightPanel';`,
  `import { LineOfSightPanel } from './components/LineOfSightPanel';\nimport { StarTrailPanel } from './components/StarTrailPanel';`
);
appCode = appCode.replace(
  `<LineOfSightPanel />`,
  `<LineOfSightPanel />\n      <StarTrailPanel />`
);
fs.writeFileSync('src/App.tsx', appCode);

let dashCode = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
// add Compass icon
dashCode = dashCode.replace(
  /Telescope, Snowflake, MountainSnow \} from 'lucide-react';/,
  `Telescope, Snowflake, MountainSnow, Compass } from 'lucide-react';`
);

dashCode = dashCode.replace(
  /    showLosPanel,\n    setShowLosPanel\n  \} = useSimulation\(\);/,
  `    showLosPanel,\n    setShowLosPanel,\n    showStarTrail,\n    setShowStarTrail\n  } = useSimulation();`
);
dashCode = dashCode.replace(
  /grid-cols-2 gap-1">/,
  `grid-cols-2 gap-1">`
);
dashCode = dashCode.replace(
  /<button \n                  onClick=\{.*?setShowLosPanel.*?Line of Sight\n                <\/button>/s,
  `$&
                <button 
                  onClick={() => setShowStarTrail(!showStarTrail)}
                  className={\`w-full flex items-center justify-center gap-1.5 \${showStarTrail ? 'bg-yellow-900/40 text-yellow-400 border-yellow-500/50' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'} text-[9px] py-1.5 rounded-md transition-colors border\`}
                >
                  <Compass size={10} />
                  Bintang
                </button>`
);
fs.writeFileSync('src/components/Dashboard.tsx', dashCode);

let storeCode = fs.readFileSync('src/store/useSimulation.ts', 'utf8');
storeCode = storeCode.replace(
  `  showLosPanel: boolean;`,
  `  showLosPanel: boolean;\n  showStarTrail: boolean;`
);
storeCode = storeCode.replace(
  `  setShowLosPanel: (show: boolean) => void;`,
  `  setShowLosPanel: (show: boolean) => void;\n  setShowStarTrail: (show: boolean) => void;`
);
storeCode = storeCode.replace(
  `  showLosPanel: false,`,
  `  showLosPanel: false,\n  showStarTrail: false,`
);
storeCode = storeCode.replace(
  `  setShowLosPanel: (show) => set({ showLosPanel: show }),`,
  `  setShowLosPanel: (show) => set({ showLosPanel: show }),\n  setShowStarTrail: (show) => set({ showStarTrail: show }),`
);
fs.writeFileSync('src/store/useSimulation.ts', storeCode);
