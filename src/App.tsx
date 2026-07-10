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
import { Constellations } from './components/Constellations';
import { LocationPin } from './components/LocationPin';
import { MAP_RADIUS } from './lib/astronomy';

export default function App() {
  const orbitRef = useRef<any>(null);

  return (
    <div className="w-full h-screen bg-zinc-950 overflow-hidden relative">
      <LocationSearch />
      <Dashboard />
      <MoonPanel />
      <PlaybackControls />
      <CameraNavigation />
      
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

