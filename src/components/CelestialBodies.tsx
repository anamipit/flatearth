import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation } from '../store/useSimulation';
import { getSunPosition, getMoonPosition, getGMST, getSubpoint, latLonToFlatEarth, getAngularDistance } from '../lib/astronomy';
import { Sphere } from '@react-three/drei';

export function CelestialBodies() {
  const sunRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const moonMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const shadowMatRef = useRef<THREE.ShaderMaterial>(null);
  
  const { currentTime, advanceTime, sunScale, moonScale, sunHeight, moonHeight } = useSimulation();

  const shadowUniforms = useMemo(() => ({
    umbraRatio: { value: 0.3 },
    opacity: { value: 0.0 }
  }), []);

  useFrame((state, delta) => {
    // Delta is in seconds, advance simulation
    advanceTime(delta * 1000);
    
    const date = new Date(useSimulation.getState().currentTime);
    const gmst = getGMST(date);
    
    const sunPos = getSunPosition(date);
    const sunSub = getSubpoint(sunPos.ra, sunPos.dec, gmst);
    const sunFlat = latLonToFlatEarth(sunSub.lat, sunSub.lon);
    
    if (sunRef.current) {
      sunRef.current.position.set(sunFlat.x, useSimulation.getState().sunHeight, sunFlat.z);
    }
    
    const moonPos = getMoonPosition(date);
    const moonSub = getSubpoint(moonPos.ra, moonPos.dec, gmst);
    const moonFlat = latLonToFlatEarth(moonSub.lat, moonSub.lon);
    
    if (moonRef.current) {
      moonRef.current.position.set(moonFlat.x, useSimulation.getState().moonHeight, moonFlat.z);
    }

    // Solar Eclipse Shadow (Umbra / Penumbra) on the ground
    const sunMoonDist = getAngularDistance(sunSub.lat, sunSub.lon, moonSub.lat, moonSub.lon);
    if (shadowRef.current && shadowMatRef.current) {
      if (sunMoonDist < 5.0) {
        shadowRef.current.position.set(moonFlat.x, 0.02, moonFlat.z);
        shadowRef.current.visible = true;
        
        // Calculate opacity based on angular distance
        const opacity = Math.max(0, 1.0 - (sunMoonDist / 5.0));
        shadowMatRef.current.uniforms.opacity.value = opacity * 0.9;
        
        // Scale shadow based on moon scale
        const s = 4 * moonScale;
        shadowRef.current.scale.set(s, s, 1);
      } else {
        shadowRef.current.visible = false;
      }
    }

    // Lunar Eclipse logic for moon coloring
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
      <group ref={sunRef} scale={[sunScale, sunScale, sunScale]}>
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
      <group ref={moonRef} scale={[moonScale, moonScale, moonScale]}>
        <Sphere args={[0.18, 32, 32]}>
          <meshStandardMaterial ref={moonMatRef} color="#e2e8f0" roughness={0.9} metalness={0.1} />
        </Sphere>
      </group>

      {/* Solar Eclipse Shadow on the map */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial 
          ref={shadowMatRef}
          transparent={true}
          depthWrite={false}
          uniforms={shadowUniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float umbraRatio;
            uniform float opacity;
            varying vec2 vUv;
            void main() {
              float dist = distance(vUv, vec2(0.5));
              if (dist > 0.5) discard;
              
              float alpha = 1.0;
              if (dist > 0.5 * umbraRatio) {
                alpha = 1.0 - smoothstep(0.5 * umbraRatio, 0.5, dist);
              }
              
              gl_FragColor = vec4(0.0, 0.0, 0.0, alpha * opacity);
            }
          `}
        />
      </mesh>
    </>
  );
}
