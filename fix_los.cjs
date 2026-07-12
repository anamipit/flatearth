const fs = require('fs');

const losCode = `import React, { useState } from 'react';
import { Telescope, X, Mountain, Waves, Eye } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';

export function LineOfSightPanel() {
  const { showLosPanel, setShowLosPanel } = useSimulation();
  const [observerHeight, setObserverHeight] = useState<number>(2); // meters
  const [targetDistance, setTargetDistance] = useState<number>(10); // km
  const [targetHeight, setTargetHeight] = useState<number>(0); // meters

  if (!showLosPanel) return null;

  // Globe curvature math
  // Distance to horizon: d = sqrt(2 * R * h), where R is earth radius (6371km), h is height in km
  // Earth drop (hidden height) at distance D: 
  // Hidden = sqrt(D^2 + R^2) - R
  // If observer is at height h1, they can see distance d1 to horizon.
  // The remaining distance to target is d2 = D - d1.
  // The amount hidden at target is roughly h2 = d2^2 / (2*R)

  const R = 6371000; // meters
  const d1 = Math.sqrt(2 * R * observerHeight); // horizon distance in meters
  
  const D = targetDistance * 1000; // target distance in meters
  
  let hiddenHeight = 0;
  if (D > d1) {
    const d2 = D - d1;
    hiddenHeight = (d2 * d2) / (2 * R);
  }

  // Flat earth drop is always 0
  
  const isVisibleGlobe = targetHeight >= hiddenHeight;

  return (
    <div className="absolute top-4 right-1/2 translate-x-[40%] z-20 w-64 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-2xl font-sans">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[11px] font-medium text-zinc-100 flex items-center gap-1.5">
          <Telescope size={12} className="text-purple-400" />
          Kalkulator Kelengkungan
        </h2>
        <button onClick={() => setShowLosPanel(false)} className="text-zinc-500 hover:text-white transition-colors">
          <X size={12} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
            <span className="flex items-center gap-1"><Eye size={10} /> Tinggi Pengamat (m)</span>
            <span className="font-mono text-zinc-200">{observerHeight} m</span>
          </div>
          <input 
            type="range" min="1" max="100" step="1" 
            value={observerHeight} onChange={(e) => setObserverHeight(parseFloat(e.target.value))}
            className="w-full accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
            <span className="flex items-center gap-1"><Waves size={10} /> Jarak Objek (km)</span>
            <span className="font-mono text-zinc-200">{targetDistance} km</span>
          </div>
          <input 
            type="range" min="1" max="100" step="1" 
            value={targetDistance} onChange={(e) => setTargetDistance(parseFloat(e.target.value))}
            className="w-full accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
            <span className="flex items-center gap-1"><Mountain size={10} /> Tinggi Objek (m)</span>
            <span className="font-mono text-zinc-200">{targetHeight} m</span>
          </div>
          <input 
            type="range" min="0" max="200" step="1" 
            value={targetHeight} onChange={(e) => setTargetHeight(parseFloat(e.target.value))}
            className="w-full accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
          <div className="text-[9px] font-medium text-zinc-400 border-b border-zinc-800/50 pb-1 mb-1">Globe (Bumi Bulat)</div>
          <div className="flex justify-between">
            <span className="text-[9px] text-zinc-500">Tertutup Lengkungan:</span>
            <span className="font-mono text-[10px] text-zinc-200">{hiddenHeight.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-zinc-500">Status Objek:</span>
            <span className={\`font-mono text-[10px] \${isVisibleGlobe ? 'text-emerald-400' : 'text-red-400'}\`}>
              {isVisibleGlobe ? 'Terlihat Sebagian/Penuh' : 'Tertutup Total (Invisible)'}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
          <div className="text-[9px] font-medium text-zinc-400 border-b border-zinc-800/50 pb-1 mb-1">Flat Earth</div>
          <div className="flex justify-between">
            <span className="text-[9px] text-zinc-500">Tertutup Lengkungan:</span>
            <span className="font-mono text-[10px] text-zinc-200">0 m</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-zinc-500">Status Objek:</span>
            <span className="font-mono text-[10px] text-emerald-400">
              Terlihat Penuh (Batas: Atmospheric Glare)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/components/LineOfSightPanel.tsx', losCode);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  `import { FlightRoutePanel } from './components/FlightRoutePanel';`,
  `import { FlightRoutePanel } from './components/FlightRoutePanel';\nimport { LineOfSightPanel } from './components/LineOfSightPanel';`
);
appCode = appCode.replace(
  `<FlightRoutePanel />`,
  `<FlightRoutePanel />\n      <LineOfSightPanel />`
);
fs.writeFileSync('src/App.tsx', appCode);

let dashCode = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dashCode = dashCode.replace(
  /    showIceWall,\n    setShowIceWall\n  \} = useSimulation\(\);/,
  `    showIceWall,\n    setShowIceWall,\n    showLosPanel,\n    setShowLosPanel\n  } = useSimulation();`
);
dashCode = dashCode.replace(
  /<button \n                  onClick=\{.*?setShowIceWall.*?Dinding Es\n                <\/button>/s,
  `$&
                <button 
                  onClick={() => setShowLosPanel(!showLosPanel)}
                  className={\`w-full flex items-center justify-center gap-1.5 \${showLosPanel ? 'bg-purple-900/40 text-purple-400 border-purple-500/50' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'} text-[9px] py-1.5 rounded-md transition-colors border\`}
                >
                  <Telescope size={10} />
                  Line of Sight
                </button>`
);
fs.writeFileSync('src/components/Dashboard.tsx', dashCode);

let storeCode = fs.readFileSync('src/store/useSimulation.ts', 'utf8');
storeCode = storeCode.replace(
  `  showIceWall: boolean;`,
  `  showIceWall: boolean;\n  showLosPanel: boolean;`
);
storeCode = storeCode.replace(
  `  setShowIceWall: (show: boolean) => void;`,
  `  setShowIceWall: (show: boolean) => void;\n  setShowLosPanel: (show: boolean) => void;`
);
storeCode = storeCode.replace(
  `  showIceWall: true,`,
  `  showIceWall: true,\n  showLosPanel: false,`
);
storeCode = storeCode.replace(
  `  setShowIceWall: (show) => set({ showIceWall: show }),`,
  `  setShowIceWall: (show) => set({ showIceWall: show }),\n  setShowLosPanel: (show) => set({ showLosPanel: show }),`
);
fs.writeFileSync('src/store/useSimulation.ts', storeCode);
