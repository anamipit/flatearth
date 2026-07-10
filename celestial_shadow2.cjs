const fs = require('fs');

let code = fs.readFileSync('src/components/CelestialBodies.tsx', 'utf8');

const useFrameReplacement = `  useFrame((state, delta) => {
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
  });`;

code = code.replace(/  useFrame\(\(state, delta\) => \{.*?  \}\);/s, useFrameReplacement);

fs.writeFileSync('src/components/CelestialBodies.tsx', code);
console.log("Updated shadow logic");
