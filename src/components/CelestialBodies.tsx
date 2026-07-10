import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation } from '../store/useSimulation';
import { getSunPosition, getMoonPosition, getGMST, getSubpoint, latLonToFlatEarth, getAngularDistance } from '../lib/astronomy';
import { Sphere, Html } from '@react-three/drei';
import { useState } from 'react';

export function CelestialBodies() {
  const sunRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const moonMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const shadowMatRef = useRef<THREE.ShaderMaterial>(null);
  
  const { currentTime, advanceTime, sunScale, moonScale, sunHeight, moonHeight, selectedPlanet, setSelectedPlanet } = useSimulation();
  const [hoveredBody, setHoveredBody] = useState<string | null>(null);

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
    const currentSunHeight = useSimulation.getState().sunHeight;
    const currentMoonHeight = useSimulation.getState().moonHeight;
    const currentMoonScale = useSimulation.getState().moonScale;
    const currentSunScale = useSimulation.getState().sunScale;
    
    if (sunRef.current) {
      sunRef.current.position.set(sunFlat.x, currentSunHeight, sunFlat.z);
    }
    
    const moonPos = getMoonPosition(date);
    const moonSub = getSubpoint(moonPos.ra, moonPos.dec, gmst);
    const moonFlat = latLonToFlatEarth(moonSub.lat, moonSub.lon);
    
    if (moonRef.current) {
      moonRef.current.position.set(moonFlat.x, currentMoonHeight, moonFlat.z);
    }

    // New Geometrical Shadow Logic for Solar Eclipse
    if (shadowRef.current && shadowMatRef.current) {
      const dx = moonFlat.x - sunFlat.x;
      const dy = currentMoonHeight - currentSunHeight;
      const dz = moonFlat.z - sunFlat.z;

      // Only cast shadow if moon is lower than sun
      if (dy < -0.01) {
        const t_ground = -currentSunHeight / dy;
        const shadowX = sunFlat.x + t_ground * dx;
        const shadowZ = sunFlat.z + t_ground * dz;
        
        const shadowDistFromCenter = Math.sqrt(shadowX * shadowX + shadowZ * shadowZ);
        
        if (shadowDistFromCenter < 15.0 && t_ground > 1.0) { // t_ground > 1 means ground is further than moon
          shadowRef.current.position.set(shadowX, 0.02, shadowZ);
          shadowRef.current.visible = true;
          
          const R_sun = 0.2 * currentSunScale;
          const R_moon = 0.18 * currentMoonScale;
          
          const distSunMoon = Math.sqrt(dx*dx + dy*dy + dz*dz);
          const distMoonGroundRay = (t_ground - 1.0) * distSunMoon;
          
          // Physical calculation of shadow radii
          let R_penumbra = R_moon + (R_sun + R_moon) * (distMoonGroundRay / distSunMoon);
          let R_umbra = R_moon - (R_sun - R_moon) * (distMoonGroundRay / distSunMoon);
          
          // Cap penumbra so it doesn't cover the whole map wildly if scaled weirdly
          R_penumbra = Math.min(R_penumbra, 15.0);
          
          const s = R_penumbra * 2.0;
          // umbra ratio for the shader
          const umbraRatio = Math.max(0.001, Math.min(0.999, Math.abs(R_umbra) / R_penumbra));
          
          shadowRef.current.scale.set(s, s, 1);
          shadowMatRef.current.uniforms.umbraRatio.value = umbraRatio;
          
          // Annular if R_umbra < 0
          const isAnnular = R_umbra < 0;
          const centerDarkness = isAnnular ? 0.7 : 0.95;
          
          // Fade out opacity as penumbra gets larger to simulate diffused light
          // if penumbra is huge, opacity approaches 0
          const opacity = Math.max(0, 1.0 - (R_penumbra / 10.0));
          shadowMatRef.current.uniforms.opacity.value = opacity * centerDarkness;
        } else {
          shadowRef.current.visible = false;
        }
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
      <group 
        ref={sunRef} 
        scale={[sunScale, sunScale, sunScale]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPlanet(selectedPlanet === 'Sun' ? null : 'Sun');
        }}
        onPointerEnter={(e) => { e.stopPropagation(); setHoveredBody('Sun'); }}
        onPointerLeave={(e) => { e.stopPropagation(); setHoveredBody(null); }}
      >
        <Sphere args={[0.2, 32, 32]}>
          <meshBasicMaterial color="#fef08a" />
        </Sphere>
        {selectedPlanet === 'Sun' && (
          <Sphere args={[0.25, 32, 32]}>
            <meshBasicMaterial color="#fef08a" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
          </Sphere>
        )}
        {/* Sun light illuminating the Moon and Earth */}
        <pointLight color="#ffffff" intensity={3} distance={150} decay={0} />
        {/* Glow effect */}
        <Sphere args={[0.5, 32, 32]}>
          <meshBasicMaterial color="#fde047" transparent opacity={selectedPlanet === 'Sun' ? 0.4 : 0.25} blending={THREE.AdditiveBlending} />
        </Sphere>
        
        {/* Hitbox */}
        <Sphere args={[0.8, 16, 16]}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </Sphere>
        
        {(hoveredBody === 'Sun' || selectedPlanet === 'Sun') && (
          <Html position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
            <div className="bg-zinc-950/90 backdrop-blur text-xs px-2 py-0.5 rounded border shadow font-medium whitespace-nowrap border-yellow-500/50 text-yellow-400">
              Matahari
            </div>
          </Html>
        )}
      </group>
      
      {/* Moon */}
      <group 
        ref={moonRef} 
        scale={[moonScale, moonScale, moonScale]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPlanet(selectedPlanet === 'Moon' ? null : 'Moon');
        }}
        onPointerEnter={(e) => { e.stopPropagation(); setHoveredBody('Moon'); }}
        onPointerLeave={(e) => { e.stopPropagation(); setHoveredBody(null); }}
      >
        <Sphere args={[0.18, 32, 32]}>
          <meshStandardMaterial ref={moonMatRef} color="#e2e8f0" roughness={0.9} metalness={0.1} emissive={selectedPlanet === 'Moon' ? '#3b82f6' : '#000000'} emissiveIntensity={selectedPlanet === 'Moon' ? 0.3 : 0} />
        </Sphere>
        {selectedPlanet === 'Moon' && (
          <Sphere args={[0.22, 32, 32]}>
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
          </Sphere>
        )}
        
        {/* Hitbox */}
        <Sphere args={[0.7, 16, 16]}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </Sphere>
        
        {(hoveredBody === 'Moon' || selectedPlanet === 'Moon') && (
          <Html position={[0, 1.2, 0]} center zIndexRange={[100, 0]}>
            <div className="bg-zinc-950/90 backdrop-blur text-xs px-2 py-0.5 rounded border shadow font-medium whitespace-nowrap border-indigo-500/50 text-indigo-400">
              Bulan
            </div>
          </Html>
        )}
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
