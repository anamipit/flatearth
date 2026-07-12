import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useSimulation } from '../store/useSimulation';
import { latLonToFlatEarth } from '../lib/astronomy';

export function FlightRoute3D() {
  const routeDeparture = useSimulation(state => state.routeDeparture);
  const routeArrival = useSimulation(state => state.routeArrival);
  const showFlightPanel = useSimulation(state => state.showFlightPanel);

  const lineRef = useRef<any>(null);

  const { points, midPoint } = useMemo(() => {
    if (!showFlightPanel || !routeDeparture || !routeArrival) return { points: [], midPoint: null };

    const depFlat = latLonToFlatEarth(routeDeparture.lat, routeDeparture.lon);
    const arrFlat = latLonToFlatEarth(routeArrival.lat, routeArrival.lon);

    const v1 = new THREE.Vector3(depFlat.x, 0.05, depFlat.z);
    const v2 = new THREE.Vector3(arrFlat.x, 0.05, arrFlat.z);

    // Create a curved arc between the two points to simulate flight path
    // Height of the curve depends on the distance
    const dist = v1.distanceTo(v2);
    const midHeight = Math.max(0.5, dist * 0.15); 
    
    const midX = (v1.x + v2.x) / 2;
    const midZ = (v1.z + v2.z) / 2;
    
    // We use QuadraticBezierCurve3
    const controlPoint = new THREE.Vector3(midX, midHeight, midZ);
    
    const curve = new THREE.QuadraticBezierCurve3(v1, controlPoint, v2);
    
    // Get points along the curve
    const pts = curve.getPoints(50);
    
    return { points: pts, midPoint: new THREE.Vector3(midX, midHeight + 0.2, midZ) };
  }, [routeDeparture, routeArrival, showFlightPanel]);

  useFrame(({ clock }) => {
    if (lineRef.current && lineRef.current.material) {
      lineRef.current.material.dashOffset -= 0.01;
    }
  });

  if (!showFlightPanel || points.length === 0) return null;

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color="#3b82f6"
        lineWidth={3}
        dashed={true}
        dashSize={0.2}
        gapSize={0.1}
        opacity={0.8}
        transparent
      >
        
      </Line>
      
      {/* Starting point dot */}
      <mesh position={points[0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      
      {/* Ending point dot */}
      <mesh position={points[points.length - 1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
    </group>
  );
}
