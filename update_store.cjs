const fs = require('fs');

let code = fs.readFileSync('src/store/useSimulation.ts', 'utf8');

code = code.replace(
  '  selectedPlanet: string | null;',
  `  selectedPlanet: string | null;\n  routeDeparture: Location | null;\n  routeArrival: Location | null;\n  showFlightPanel: boolean;`
);

code = code.replace(
  '  setSelectedPlanet: (planet: string | null) => void;',
  `  setSelectedPlanet: (planet: string | null) => void;\n  setRouteDeparture: (loc: Location | null) => void;\n  setRouteArrival: (loc: Location | null) => void;\n  setShowFlightPanel: (show: boolean) => void;`
);

code = code.replace(
  '  selectedPlanet: null,',
  `  selectedPlanet: null,\n  routeDeparture: null,\n  routeArrival: null,\n  showFlightPanel: false,`
);

code = code.replace(
  '  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),',
  `  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),\n  setRouteDeparture: (loc) => set({ routeDeparture: loc }),\n  setRouteArrival: (loc) => set({ routeArrival: loc }),\n  setShowFlightPanel: (show) => set({ showFlightPanel: show }),`
);

fs.writeFileSync('src/store/useSimulation.ts', code);
