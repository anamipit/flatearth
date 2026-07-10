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
  setMoonScale: (scale) => set({ moonScale: scale }),
  setSunHeight: (height) => set({ sunHeight: height }),
  setMoonHeight: (height) => set({ moonHeight: height }),
}));

