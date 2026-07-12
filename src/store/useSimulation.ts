import { create } from 'zustand';

interface Location {
  lat: number;
  lon: number;
  name: string;
}

interface SimulationState {
  currentTime: number; // Unix timestamp
  speedMultiplier: number;
  isPlaying: boolean;
  targetLocation: Location | null;
  sunScale: number;
  moonScale: number;
  sunHeight: number;
  moonHeight: number;
  showConstellations: boolean;
  cameraMovement: { x: number, y: number, z: number };
  cameraRotation: { x: number, y: number };
  showDatePicker: boolean;
  showAstroEvents: boolean;
  selectedPlanet: string | null;
  routeDeparture: Location | null;
  routeArrival: Location | null;
  showFlightPanel: boolean;

  setCurrentTime: (time: number) => void;
  setSpeedMultiplier: (speed: number) => void;
  togglePlay: () => void;
  advanceTime: (deltaMs: number) => void;
  resetToNow: () => void;
  setTargetLocation: (loc: Location | null) => void;
  setSunScale: (scale: number) => void;
  setMoonScale: (scale: number) => void;
  setSunHeight: (height: number) => void;
  setMoonHeight: (height: number) => void;
  setShowConstellations: (show: boolean) => void;
  setCameraMovement: (movement: { x: number, y: number, z: number }) => void;
  setCameraRotation: (rotation: { x: number, y: number }) => void;
  setShowDatePicker: (show: boolean) => void;
  setShowAstroEvents: (show: boolean) => void;
  setSelectedPlanet: (planet: string | null) => void;
  setRouteDeparture: (loc: Location | null) => void;
  setRouteArrival: (loc: Location | null) => void;
  setShowFlightPanel: (show: boolean) => void;
}

export const useSimulation = create<SimulationState>((set) => ({
  currentTime: Date.now(),
  speedMultiplier: 1, // 1x = real time
  isPlaying: true,
  targetLocation: null,
  sunScale: 1,
  moonScale: 1,
  sunHeight: 3.0,
  moonHeight: 3.0,
  showConstellations: true,
  cameraMovement: { x: 0, y: 0, z: 0 },
  cameraRotation: { x: 0, y: 0 },
  showDatePicker: false,
  showAstroEvents: false,
  selectedPlanet: null,
  routeDeparture: null,
  routeArrival: null,
  showFlightPanel: false,
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  advanceTime: (deltaMs) => set((state) => ({
    currentTime: state.isPlaying 
      ? state.currentTime + (deltaMs * state.speedMultiplier) 
      : state.currentTime
  })),
  
  resetToNow: () => set({ currentTime: Date.now(), speedMultiplier: 1, isPlaying: true }),
  setTargetLocation: (loc) => set({ targetLocation: loc }),
  setSunScale: (scale) => set({ sunScale: scale }),
  setMoonScale: (scale: number) => set({ moonScale: scale }),
  setSunHeight: (height: number) => set({ sunHeight: height }),
  setMoonHeight: (height: number) => set({ moonHeight: height }),
  setShowConstellations: (show: boolean) => set({ showConstellations: show }),
  setCameraMovement: (movement) => set({ cameraMovement: movement }),
  setCameraRotation: (rotation) => set({ cameraRotation: rotation }),
  setShowDatePicker: (show) => set({ showDatePicker: show }),
  setShowAstroEvents: (show) => set({ showAstroEvents: show }),
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  setRouteDeparture: (loc) => set({ routeDeparture: loc }),
  setRouteArrival: (loc) => set({ routeArrival: loc }),
  setShowFlightPanel: (show) => set({ showFlightPanel: show }),
}));


