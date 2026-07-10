import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Circle } from '@react-three/drei';
import { MAP_RADIUS } from '../lib/astronomy';
import { useSimulation } from '../store/useSimulation';
import { getSunPosition, getGMST, getSubpoint } from '../lib/astronomy';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D tDay;
  uniform sampler2D tNight;
  uniform float sunLat;
  uniform float sunLon;
  
  varying vec2 vUv;
  
  #define PI 3.14159265359
  #define RAD (PI / 180.0)
  #define DEG (180.0 / PI)
  
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    
    if (r > 1.0) {
      discard;
    }
    
    // Azimuthal Equidistant mapping
    float lat = 90.0 - r * 180.0;
    
    // Calculate longitude mapping (x maps to p.x, -z maps to p.y)
    // We want lon=0 at bottom (p.y=-0.5), lon=90 at right (p.x=0.5)
    float lonRad = atan(p.x, -p.y);
    float lon = lonRad * DEG;
    
    // Normalize lon to -180 to 180
    lon = mod(lon + 180.0, 360.0) - 180.0;
    
    // Map to equirectangular UV for texture sampling
    float eqU = (lon + 180.0) / 360.0;
    float eqV = (lat + 90.0) / 180.0;
    
    vec2 uvMap = vec2(eqU, eqV);
    
    vec4 dayColor = texture2D(tDay, uvMap);
    vec4 nightMap = texture2D(tNight, uvMap);
    
    // Calculate distance to sun for day/night shading
    float lat1 = lat * RAD;
    float lat2 = sunLat * RAD;
    float dLon = (lon - sunLon) * RAD;
    
    float cos_d = sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(dLon);
    // Clamp to prevent NaN due to precision issues
    cos_d = clamp(cos_d, -1.0, 1.0);
    float d = acos(cos_d); // 0 to PI
    
    // Terminator transition (twilight zone)
    // 90 degrees = PI/2. Let's make a 12-degree transition zone (twilight)
    float twilightSpan = 12.0 * RAD;
    float transitionStart = (90.0 * RAD) - (twilightSpan / 2.0);
    float transitionEnd = (90.0 * RAD) + (twilightSpan / 2.0);
    
    float lightFactor = 1.0 - smoothstep(transitionStart, transitionEnd, d);
    
    // Night color composite
    vec3 darkBase = dayColor.rgb * vec3(0.02, 0.04, 0.1);
    vec3 cityLights = nightMap.rgb * vec3(1.0, 0.8, 0.5) * 1.5;
    vec3 nightFinal = darkBase + cityLights;
    
    vec3 finalColor = mix(nightFinal, dayColor.rgb, lightFactor);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function FlatEarthMap() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const [dayTexture, nightTexture] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-night.jpg'
  ]);
  
  // Ensure textures wrap horizontally
  dayTexture.wrapS = THREE.RepeatWrapping;
  nightTexture.wrapS = THREE.RepeatWrapping;

  const uniforms = useMemo(() => ({
    tDay: { value: dayTexture },
    tNight: { value: nightTexture },
    sunLat: { value: 0.0 },
    sunLon: { value: 0.0 },
  }), [dayTexture, nightTexture]);

  useFrame(() => {
    if (materialRef.current) {
      const date = new Date(useSimulation.getState().currentTime);
      const gmst = getGMST(date);
      const sunPos = getSunPosition(date);
      const sunSub = getSubpoint(sunPos.ra, sunPos.dec, gmst);
      
      materialRef.current.uniforms.sunLat.value = sunSub.lat;
      materialRef.current.uniforms.sunLon.value = sunSub.lon;
    }
  });

  return (
    <Circle args={[MAP_RADIUS, 128]} position={[0, 0, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
      />
    </Circle>
  );
}
