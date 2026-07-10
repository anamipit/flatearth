import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation } from '../store/useSimulation';
import { latLonToFlatEarth } from '../lib/astronomy';

interface CameraControllerProps {
  orbitRef: React.MutableRefObject<any>;
}

export function CameraController({ orbitRef }: CameraControllerProps) {
  const { camera } = useThree();
  const targetLocation = useSimulation((state) => state.targetLocation);
  
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetCtrlPos = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (targetLocation) {
      const flat = latLonToFlatEarth(targetLocation.lat, targetLocation.lon);
      
      // Target for the OrbitControls (look up towards the sky above the city)
      // Sun and Moon are around y = 3.0, so looking at y = 2.0 gives a good view
      targetCtrlPos.current = new THREE.Vector3(flat.x, 2.0, flat.z);
      
      // Camera position: offset from the city to give a good viewing angle
      const dir = new THREE.Vector3(flat.x, 0, flat.z).normalize();
      if (dir.lengthSq() === 0) dir.set(0, 0, 1);
      
      // Position the camera slightly back and low, so it looks UP at the target
      const offsetDistance = 6;
      const height = 0.2; 
      
      targetCamPos.current = new THREE.Vector3(
        flat.x + dir.x * offsetDistance, 
        height, 
        flat.z + dir.z * offsetDistance
      );
    } else {
      // If cleared, maybe go back to default view? Or just leave it where it is.
      // Let's leave it where it is to avoid jarring movements.
    }
  }, [targetLocation]);

  useFrame(() => {
    if (targetCamPos.current && targetCtrlPos.current && orbitRef.current) {
      camera.position.lerp(targetCamPos.current, 0.05);
      orbitRef.current.target.lerp(targetCtrlPos.current, 0.05);
      
      if (camera.position.distanceTo(targetCamPos.current) < 0.1) {
        // Snap to exact position
        camera.position.copy(targetCamPos.current);
        orbitRef.current.target.copy(targetCtrlPos.current);
        
        targetCamPos.current = null;
        targetCtrlPos.current = null;
      }
    }
  });

  return null;
}
