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
  setCurrentTime: (time: number) => void;
  setSpeedMultiplier: (speed: number) => void;
  togglePlay: () => void;
  advanceTime: (deltaMs: number) => void;
  resetToNow: () => void;
  setTargetLocation: (loc: Location | null) => void;
}

export const useSimulation = create<SimulationState>((set) => ({
  currentTime: Date.now(),
  speedMultiplier: 1, // 1x = real time
  isPlaying: true,
  targetLocation: null,
  
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
}));

