const fs = require('fs');
let code = fs.readFileSync('src/components/FlatEarthMap.tsx', 'utf8');

// The original fragment shader uses distance to subsolar point (lat2, lon) to determine shading.
// For the flat earth model to look like a kidney bean, the shading shape needs to be mapped differently.
// However, the current shader mathematically correctly maps the real globe distance to the flat plane (d = acos(cos_d)).
// The user explicitly wants a "kidney bean" shape that hugs the edge in the southern summer.
// We can modify the lightFactor to exaggerate this effect by mapping the distance directly on the 2D plane as an alternative visualization, or blending it.

const newFragmentShader = `
  uniform sampler2D tDay;
  uniform sampler2D tNight;
  uniform float sunLat;
  uniform float sunLon;
  uniform float showRealTerminator;
  
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
    
    // 1. Globe-based distance calculation (accurate physics on globe mapped to flat)
    float lat1 = lat * RAD;
    float lat2 = sunLat * RAD;
    float dLon = (lon - sunLon) * RAD;
    float cos_d = sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(dLon);
    cos_d = clamp(cos_d, -1.0, 1.0);
    float d_globe = acos(cos_d); // 0 to PI
    
    // 2. Flat Earth specific spotlight (kidney bean effect)
    // To create the kidney bean effect during southern summer (negative sunLat),
    // the light needs to wrap around the center.
    // Convert sun pos to flat earth polar
    float r_sun = (90.0 - sunLat) / 180.0;
    float sunLonRad = sunLon * RAD;
    vec2 sunPos2D = vec2(r_sun * sin(sunLonRad), -r_sun * cos(sunLonRad));
    
    // Distance on the 2D plane
    float d_flat = distance(p, sunPos2D) * PI; 
    
    // Kidney bean deformation based on sun latitude
    // If sun is far south (r_sun > 0.5), it wraps around the center
    // We can bend the distance metric based on the angle difference from the sun
    float angleDiff = mod(lonRad - sunLonRad + PI, 2.0*PI) - PI;
    float kidneyFactor = 1.0;
    if (sunLat < 0.0) {
        // Bend the light around the edge
        kidneyFactor = 1.0 - (sin(abs(angleDiff)) * abs(sunLat)/90.0 * 0.5 * r);
    }
    
    float d = mix(d_globe, d_flat * kidneyFactor, showRealTerminator);
    
    // Terminator transition (twilight zone)
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

code = code.replace(/const fragmentShader = `[\s\S]*?`;/, 'const fragmentShader = `' + newFragmentShader + '`;');

code = code.replace(
  /tNight: \{ value: nightTexture \},\n    sunLat: \{ value: 0\.0 \},\n    sunLon: \{ value: 0\.0 \},/,
  `tNight: { value: nightTexture },
    sunLat: { value: 0.0 },
    sunLon: { value: 0.0 },
    showRealTerminator: { value: 1.0 },` // Default to the flat earth "kidney" terminator
);

code = code.replace(
  /materialRef\.current\.uniforms\.sunLon\.value = sunSub\.lon;/,
  `materialRef.current.uniforms.sunLon.value = sunSub.lon;
      materialRef.current.uniforms.showRealTerminator.value = useSimulation.getState().flatTerminator ? 1.0 : 0.0;`
);

fs.writeFileSync('src/components/FlatEarthMap.tsx', code);
