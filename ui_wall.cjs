const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// import icon
code = code.replace(
  /SunDim, Telescope, Snowflake \} from 'lucide-react';/,
  `SunDim, Telescope, Snowflake, MountainSnow } from 'lucide-react';`
);

// get variables
code = code.replace(
  /    flatTerminator,\n    setFlatTerminator\n  \} = useSimulation\(\);/,
  `    flatTerminator,\n    setFlatTerminator,\n    showIceWall,\n    setShowIceWall\n  } = useSimulation();`
);

// Add buttons
code = code.replace(
  /<button \n                  onClick=\{.*?setFlatTerminator.*?Sorotan Flat\n                <\/button>/s,
  `$&
                <button 
                  onClick={() => setShowIceWall(!showIceWall)}
                  className={\`w-full flex items-center justify-center gap-1.5 \${showIceWall ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/50' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'} text-[9px] py-1.5 rounded-md transition-colors border\`}
                >
                  <MountainSnow size={10} />
                  Dinding Es
                </button>`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);

code = fs.readFileSync('src/store/useSimulation.ts', 'utf8');
code = code.replace(
  `  flatTerminator: boolean;`,
  `  flatTerminator: boolean;\n  showIceWall: boolean;`
);
code = code.replace(
  `  setFlatTerminator: (show: boolean) => void;`,
  `  setFlatTerminator: (show: boolean) => void;\n  setShowIceWall: (show: boolean) => void;`
);
code = code.replace(
  `  flatTerminator: true,`,
  `  flatTerminator: true,\n  showIceWall: true,`
);
code = code.replace(
  `  setFlatTerminator: (show) => set({ flatTerminator: show }),`,
  `  setFlatTerminator: (show) => set({ flatTerminator: show }),\n  setShowIceWall: (show) => set({ showIceWall: show }),`
);
fs.writeFileSync('src/store/useSimulation.ts', code);

code = fs.readFileSync('src/components/IceWall.tsx', 'utf8');
code = code.replace(
  `import { MAP_RADIUS } from '../lib/astronomy';`,
  `import { MAP_RADIUS } from '../lib/astronomy';\nimport { useSimulation } from '../store/useSimulation';`
);
code = code.replace(
  `export function IceWall() {\n  return (`,
  `export function IceWall() {\n  const showIceWall = useSimulation(state => state.showIceWall);\n  if (!showIceWall) return null;\n  return (`
);
fs.writeFileSync('src/components/IceWall.tsx', code);

