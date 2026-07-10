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

      if (dy < -0.01) {
        // Calculate intersection with ground plane (y=0)
        const t = -currentSunHeight / dy;
        const shadowX = sunFlat.x + t * dx;
        const shadowZ = sunFlat.z + t * dz;
        
        // Calculate distance from shadow center to origin to check if it's on the map (roughly)
        const shadowDistFromCenter = Math.sqrt(shadowX * shadowX + shadowZ * shadowZ);
        
        if (shadowDistFromCenter < 15.0) { // MAP_RADIUS is 10, give it some padding
          shadowRef.current.position.set(shadowX, 0.02, shadowZ);
          shadowRef.current.visible = true;
          
          // Size of shadow grows as it gets further from the moon (light scattering/penumbra)
          // But geometrically, if the sun is a point light, the shadow size is proportional to (t * moonRadius)
          // Actually, umbra/penumbra depends on Sun's physical size. Since our sun is scaled, let's make it look good.
          
          // distance from moon to ground
          const distMoonToGround = currentMoonHeight;
          const totalDistSunToGround = currentSunHeight;
          const ratio = totalDistSunToGround / (currentSunHeight - currentMoonHeight); // similar triangles for shadow scale if point light
          
          const s = 4 * currentMoonScale * ratio;
          shadowRef.current.scale.set(s, s, 1);
          
          // Opacity depends on how close the sun and moon are in XY (angular distance)
          // For a perfect eclipse, shadow is dark. If they are far, it gets diffuse.
          // Let's use the angular distance as before to fade it out, or distance from moon to sun.
          const sunMoonDistXY = Math.sqrt(dx*dx + dz*dz);
          
          const opacity = Math.max(0, 1.0 - (sunMoonDistXY / 3.0));
          shadowMatRef.current.uniforms.opacity.value = opacity * 0.9;
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
