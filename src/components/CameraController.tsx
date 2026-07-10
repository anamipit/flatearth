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
      
      // We want to stand ON the city, looking out towards the sky.
      // So the camera is exactly at the city, height near 0
      targetCamPos.current = new THREE.Vector3(flat.x, 0.02, flat.z);
      
      const dir = new THREE.Vector3(flat.x, 0, flat.z).normalize();
      if (dir.lengthSq() === 0) dir.set(0, 0, 1);
      
      // Target for the OrbitControls (look towards the north pole / center of map)
      targetCtrlPos.current = new THREE.Vector3(
        flat.x - dir.x * 5, 
        1.5, // Look slightly up to see stars/sun/moon
        flat.z - dir.z * 5
      );
    }
  }, [targetLocation]);

  useFrame((state, delta) => {
    // 1. Handle auto-transition to target location
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

    // 2. Handle manual camera navigation from UI (X, Y, Z buttons)
    const stateSim = useSimulation.getState();
    const movement = stateSim.cameraMovement;
    const rotation = stateSim.cameraRotation;

    if ((movement.x !== 0 || movement.y !== 0 || movement.z !== 0 || rotation.x !== 0 || rotation.y !== 0) && orbitRef.current) {
      const moveSpeed = 10.0 * delta; // units per second
      const rotSpeed = 2.0 * delta; // radians per second
      
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      
      if (movement.x !== 0 || movement.y !== 0 || movement.z !== 0) {
        const moveForward = forward.clone();
        moveForward.y = 0; // Keep movement horizontal for Z
        moveForward.normalize();
        
        const moveRight = right.clone();
        moveRight.y = 0; // Keep movement horizontal for X
        moveRight.normalize();
        
        const up = new THREE.Vector3(0, 1, 0); // World UP
        
        const moveVec = new THREE.Vector3()
          .addScaledVector(moveRight, movement.x * moveSpeed)
          .addScaledVector(up, movement.y * moveSpeed)
          .addScaledVector(moveForward, -movement.z * moveSpeed);
        
        camera.position.add(moveVec);
        orbitRef.current.target.add(moveVec);
      }

      if (rotation.x !== 0 || rotation.y !== 0) {
        // To rotate view, we rotate the target around the camera
        const lookDir = new THREE.Vector3().subVectors(orbitRef.current.target, camera.position);
        
        // Horizontal rotation (around world Y axis)
        if (rotation.x !== 0) {
          const axis = new THREE.Vector3(0, 1, 0);
          lookDir.applyAxisAngle(axis, rotation.x * rotSpeed);
        }
        
        // Vertical rotation (around local right axis)
        if (rotation.y !== 0) {
          const axis = right.clone().normalize();
          // Prevent looking too far up or down (clamp)
          const currentPitch = Math.asin(lookDir.y / lookDir.length());
          const pitchChange = rotation.y * rotSpeed;
          const newPitch = currentPitch + pitchChange;
          
          if (newPitch > -Math.PI/2 + 0.1 && newPitch < Math.PI/2 - 0.1) {
             lookDir.applyAxisAngle(axis, pitchChange);
          }
        }
        
        orbitRef.current.target.copy(camera.position).add(lookDir);
      }
    }
  });

  return null;
}
