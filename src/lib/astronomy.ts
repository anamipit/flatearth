const rad = Math.PI / 180;
const deg = 180 / Math.PI;

// Days since J2000.0 (January 1.5, 2000)
export function getDaysSinceJ2000(date: Date) {
  return (date.getTime() / 86400000) - 10957.5;
}

// Calculate Sun's Right Ascension and Declination
export function getSunPosition(date: Date) {
  const d = getDaysSinceJ2000(date);
  
  // Mean anomaly
  const g = (357.529 + 0.98560028 * d) % 360;
  // Mean longitude
  const q = (280.459 + 0.98564736 * d) % 360;
  // Ecliptic longitude
  const L = q + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad);
  // Obliquity of the ecliptic
  const e = 23.439 - 0.00000036 * d;

  const ra = Math.atan2(Math.cos(e * rad) * Math.sin(L * rad), Math.cos(L * rad)) * deg;
  const dec = Math.asin(Math.sin(e * rad) * Math.sin(L * rad)) * deg;

  return { ra: (ra + 360) % 360, dec };
}

// Calculate Moon's Right Ascension and Declination (approximate Meeus algorithm)
export function getMoonPosition(date: Date) {
  const d = getDaysSinceJ2000(date);
  
  // Longitude of ascending node
  const N = (125.1228 - 0.0529538083 * d) % 360;
  // Mean anomaly
  const M = (115.3654 + 13.0649929509 * d) % 360;
  // Mean longitude
  const L = (218.316 + 13.176396 * d) % 360;

  // Ecliptic longitude & latitude
  const lambda = L + 6.289 * Math.sin(M * rad);
  const beta = 5.128 * Math.sin((lambda - N) * rad);
  const e = 23.439 - 0.00000036 * d;

  const ra = Math.atan2(
    Math.sin(lambda * rad) * Math.cos(e * rad) - Math.tan(beta * rad) * Math.sin(e * rad),
    Math.cos(lambda * rad)
  ) * deg;
  
  const dec = Math.asin(
    Math.sin(beta * rad) * Math.cos(e * rad) + Math.cos(beta * rad) * Math.sin(e * rad) * Math.sin(lambda * rad)
  ) * deg;

  return { ra: (ra + 360) % 360, dec };
}

// Calculate Greenwich Mean Sidereal Time (GMST) in degrees
export function getGMST(date: Date) {
  const d = getDaysSinceJ2000(date);
  const T = d / 36525;
  const gmst = (280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - Math.pow(T, 3) / 38710000) % 360;
  return (gmst + 360) % 360;
}

// Convert RA/Dec to Geographic Subpoint (Latitude, Longitude)
export function getSubpoint(ra: number, dec: number, gmst: number) {
  const lat = dec;
  let lon = (ra - gmst);
  lon = (lon + 540) % 360 - 180; // Normalize to [-180, 180]
  return { lat, lon };
}

// Global Flat Earth Map Config
export const MAP_RADIUS = 20;

// Convert geographic coordinates to flat earth 3D coordinates (Azimuthal Equidistant)
export function latLonToFlatEarth(lat: number, lon: number) {
  // Center is North Pole (Lat 90). Edge is South Pole (Lat -90).
  const r = ((90 - lat) / 180) * MAP_RADIUS;
  
  const x = r * Math.sin(lon * rad);
  const z = r * Math.cos(lon * rad);
  
  return { x, z, r };
}

// Calculate distance between two lat/lon points on a sphere (Haversine)
export function getAngularDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return c * deg; // Distance in degrees
}

export function getMoonPhase(date: Date) {
  const d = getDaysSinceJ2000(date);
  
  // Sun mean anomaly and longitude
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const sunL = q + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad);
  
  // Moon mean anomaly and longitude
  const M = (115.3654 + 13.0649929509 * d) % 360;
  const moonL = (218.316 + 13.176396 * d) % 360;
  const moonLambda = moonL + 6.289 * Math.sin(M * rad);
  
  // Phase angle (Moon Longitude - Sun Longitude)
  let phaseAngle = (moonLambda - sunL) % 360;
  if (phaseAngle < 0) phaseAngle += 360;
  
  // Age of the moon (0 to 29.53 days)
  const age = (phaseAngle / 360) * 29.53058867;
  
  // Illumination percentage (0 to 100)
  const illumination = ((1 - Math.cos(phaseAngle * rad)) / 2) * 100;
  
  let phaseName = "";
  if (phaseAngle < 22.5 || phaseAngle >= 337.5) phaseName = "Bulan Baru"; // New Moon
  else if (phaseAngle < 67.5) phaseName = "Sabit Awal"; // Waxing Crescent
  else if (phaseAngle < 112.5) phaseName = "Perempat Pertama"; // First Quarter
  else if (phaseAngle < 157.5) phaseName = "Cembung Awal"; // Waxing Gibbous
  else if (phaseAngle < 202.5) phaseName = "Purnama"; // Full Moon
  else if (phaseAngle < 247.5) phaseName = "Cembung Akhir"; // Waning Gibbous
  else if (phaseAngle < 292.5) phaseName = "Perempat Akhir"; // Last Quarter
  else phaseName = "Sabit Akhir"; // Waning Crescent
  
  return { phaseAngle, age, illumination, phaseName };
}

// Find next solar or lunar eclipse
export function findNextEclipse(startDate: Date, type: 'solar' | 'lunar'): Date | null {
  let currentTime = startDate.getTime() + 86400000; // start 1 day ahead
  const targetPhase = type === 'solar' ? 0 : 180;
  
  for (let day = 0; day < 365 * 10; day++) { // look ahead up to 10 years
    const date = new Date(currentTime);
    const phaseInfo = getMoonPhase(date);
    
    let phaseDiff = Math.abs(phaseInfo.phaseAngle - targetPhase);
    if (phaseDiff > 180) phaseDiff = 360 - phaseDiff;
    
    // When close to the required phase, do a fine-grained hour-by-hour search
    if (phaseDiff < 15) {
      let minDistance = 999;
      let bestTime = currentTime;
      
      for (let hour = -48; hour <= 48; hour++) {
        const hTime = currentTime + hour * 3600000;
        const hDate = new Date(hTime);
        const sun = getSunPosition(hDate);
        const moon = getMoonPosition(hDate);
        const gmst = getGMST(hDate);
        
        const sunSub = getSubpoint(sun.ra, sun.dec, gmst);
        const moonSub = getSubpoint(moon.ra, moon.dec, gmst);
        
        let dist = 0;
        if (type === 'solar') {
          dist = getAngularDistance(sunSub.lat, sunSub.lon, moonSub.lat, moonSub.lon);
        } else {
          // Lunar eclipse: Sun and Moon opposite
          const oppSunLat = -sunSub.lat;
          let oppSunLon = sunSub.lon + 180;
          if (oppSunLon > 180) oppSunLon -= 360;
          dist = getAngularDistance(oppSunLat, oppSunLon, moonSub.lat, moonSub.lon);
        }
        
        if (dist < minDistance) {
          minDistance = dist;
          bestTime = hTime;
        }
      }
      
      // If minimum distance is small enough, it's an eclipse (less than 1.5 degrees angular distance)
      if (minDistance < 1.5) {
        return new Date(bestTime);
      }
      
      // Skip ahead 20 days since next phase match is ~29.5 days away
      currentTime += 20 * 86400000;
      day += 20;
    } else {
      currentTime += 86400000; // step 1 day
    }
  }
  return null;
}

export function findEclipsesInRange(startDate: Date, endDate: Date, type: 'solar' | 'lunar'): Date[] {
  let currentTime = startDate.getTime();
  const endTime = endDate.getTime();
  const targetPhase = type === 'solar' ? 0 : 180;
  const eclipses: Date[] = [];
  
  while (currentTime < endTime) {
    const date = new Date(currentTime);
    const phaseInfo = getMoonPhase(date);
    
    let phaseDiff = Math.abs(phaseInfo.phaseAngle - targetPhase);
    if (phaseDiff > 180) phaseDiff = 360 - phaseDiff;
    
    // When close to the required phase, do a fine-grained hour-by-hour search
    if (phaseDiff < 15) {
      let minDistance = 999;
      let bestTime = currentTime;
      
      for (let hour = -48; hour <= 48; hour++) {
        const hTime = currentTime + hour * 3600000;
        const hDate = new Date(hTime);
        const sun = getSunPosition(hDate);
        const moon = getMoonPosition(hDate);
        const gmst = getGMST(hDate);
        
        const sunSub = getSubpoint(sun.ra, sun.dec, gmst);
        const moonSub = getSubpoint(moon.ra, moon.dec, gmst);
        
        let dist = 0;
        if (type === 'solar') {
          dist = getAngularDistance(sunSub.lat, sunSub.lon, moonSub.lat, moonSub.lon);
        } else {
          // Lunar eclipse: Sun and Moon opposite
          const oppSunLat = -sunSub.lat;
          let oppSunLon = sunSub.lon + 180;
          if (oppSunLon > 180) oppSunLon -= 360;
          dist = getAngularDistance(oppSunLat, oppSunLon, moonSub.lat, moonSub.lon);
        }
        
        if (dist < minDistance) {
          minDistance = dist;
          bestTime = hTime;
        }
      }
      
      if (minDistance < 1.5) {
        eclipses.push(new Date(bestTime));
      }
      
      currentTime += 20 * 86400000;
    } else {
      currentTime += 86400000;
    }
  }
  return eclipses;
}

