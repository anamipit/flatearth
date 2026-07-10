import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Dashboard } from './components/Dashboard';
import { MoonPanel } from './components/MoonPanel';
import { PlaybackControls } from './components/PlaybackControls';
import { LocationSearch } from './components/LocationSearch';
import { CameraController } from './components/CameraController';
import { CameraNavigation } from './components/CameraNavigation';
import { MapGrid } from './components/MapGrid';
import { CelestialBodies } from './components/CelestialBodies';
import { Planets } from './components/Planets';
import { Constellations } from './components/Constellations';
import { LocationPin } from './components/LocationPin';
import { DatePickerModal } from './components/DatePickerModal';
import { AstroEventsModal } from './components/AstroEventsModal';
import { AstroStats } from './components/AstroStats';
import { MAP_RADIUS } from './lib/astronomy';
import { useSimulation } from './store/useSimulation';

export default function App() {
  const orbitRef = useRef<any>(null);
  const showDatePicker = useSimulation(state => state.showDatePicker);
  const setShowDatePicker = useSimulation(state => state.setShowDatePicker);
  const showAstroEvents = useSimulation(state => state.showAstroEvents);
  const setShowAstroEvents = useSimulation(state => state.setShowAstroEvents);

  return (
    <div className="w-full h-screen bg-zinc-950 overflow-hidden relative">
      <LocationSearch />
      <Dashboard />
      <MoonPanel />
      <PlaybackControls />
      <CameraNavigation />
      
      {showDatePicker && (
        <DatePickerModal onClose={() => setShowDatePicker(false)} />
      )}
      
      {showAstroEvents && (
        <AstroEventsModal onClose={() => setShowAstroEvents(false)} />
      )}
      
      <AstroStats />

      <Canvas
        camera={{ position: [0, 15, 25], fov: 60 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#050505']} />
        
        <ambientLight intensity={0.1} />
        
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <MapGrid />
          <CelestialBodies />
          <Planets />
          <Constellations />
          <LocationPin />
          
          <CameraController orbitRef={orbitRef} />
          
          <OrbitControls 
            ref={orbitRef}
            enablePan={true}
            maxPolarAngle={Math.PI} // Allow full rotation to look up
            minDistance={0.1}
            maxDistance={80}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

