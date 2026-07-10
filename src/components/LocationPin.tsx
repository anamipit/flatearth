import React from 'react';
import { useSimulation } from '../store/useSimulation';
import { latLonToFlatEarth } from '../lib/astronomy';

export function LocationPin() {
  const targetLocation = useSimulation((state) => state.targetLocation);

  if (!targetLocation) return null;

  const flat = latLonToFlatEarth(targetLocation.lat, targetLocation.lon);

  return (
    <group position={[flat.x, 0, flat.z]}>
      {/* Pin head */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      {/* Pin base / stick */}
      <mesh position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.005, 0.01, 0.05, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Small glow ring on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.03, 0.04, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
