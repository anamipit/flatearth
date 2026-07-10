import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation } from '../store/useSimulation';
import { getSunPosition, getMoonPosition, getGMST, getSubpoint, latLonToFlatEarth, getAngularDistance } from '../lib/astronomy';
import { Sphere } from '@react-three/drei';

export function CelestialBodies() {
  const sunRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const moonMatRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const { currentTime, advanceTime } = useSimulation();

  useFrame((state, delta) => {
    // Delta is in seconds, advance simulation
    advanceTime(delta * 1000);
    
    const date = new Date(useSimulation.getState().currentTime);
    const gmst = getGMST(date);
    
    const sunPos = getSunPosition(date);
    const sunSub = getSubpoint(sunPos.ra, sunPos.dec, gmst);
    const sunFlat = latLonToFlatEarth(sunSub.lat, sunSub.lon);
    
    if (sunRef.current) {
      sunRef.current.position.set(sunFlat.x, 3.0, sunFlat.z);
    }
    
    const moonPos = getMoonPosition(date);
    const moonSub = getSubpoint(moonPos.ra, moonPos.dec, gmst);
    const moonFlat = latLonToFlatEarth(moonSub.lat, moonSub.lon);
    
    if (moonRef.current) {
      moonRef.current.position.set(moonFlat.x, 3.0, moonFlat.z); // Same height to block effectively
    }

    // Eclipse logic for coloring
    if (moonMatRef.current) {
      const oppSunLat = -sunSub.lat;
      let oppSunLon = sunSub.lon + 180;
      if (oppSunLon > 180) oppSunLon -= 360;
      
      const lunarEclipseDist = getAngularDistance(oppSunLat, oppSunLon, moonSub.lat, moonSub.lon);
      const isLunarEclipse = lunarEclipseDist < 1.5;

      const targetColor = isLunarEclipse ? new THREE.Color("#7f1d1d") : new THREE.Color("#e2e8f0");
      moonMatRef.current.color.lerp(targetColor, 0.1);
    }
  });

  return (
    <>
      {/* Sun */}
      <group ref={sunRef}>
        <Sphere args={[0.2, 32, 32]}>
          <meshBasicMaterial color="#fef08a" />
        </Sphere>
        {/* Sun light illuminating the Moon and Earth */}
        <pointLight color="#ffffff" intensity={3} distance={150} decay={0} />
        {/* Glow effect */}
        <Sphere args={[0.5, 32, 32]}>
          <meshBasicMaterial color="#fde047" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
        </Sphere>
      </group>
      
      {/* Moon */}
      <group ref={moonRef}>
        <Sphere args={[0.18, 32, 32]}>
          <meshStandardMaterial ref={moonMatRef} color="#e2e8f0" roughness={0.9} metalness={0.1} />
        </Sphere>
      </group>
    </>
  );
}
