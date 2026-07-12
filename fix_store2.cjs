const fs = require('fs');
let code = fs.readFileSync('src/store/useSimulation.ts', 'utf8');

code = code.replace(
  `  showFlightPanel: boolean;`,
  `  showFlightPanel: boolean;\n  flatTerminator: boolean;`
);

code = code.replace(
  `  setShowFlightPanel: (show: boolean) => void;`,
  `  setShowFlightPanel: (show: boolean) => void;\n  setFlatTerminator: (show: boolean) => void;`
);

code = code.replace(
  `  showFlightPanel: false,`,
  `  showFlightPanel: false,\n  flatTerminator: true,`
);

code = code.replace(
  `  setShowFlightPanel: (show) => set({ showFlightPanel: show }),`,
  `  setShowFlightPanel: (show) => set({ showFlightPanel: show }),\n  setFlatTerminator: (show) => set({ flatTerminator: show }),`
);

fs.writeFileSync('src/store/useSimulation.ts', code);
