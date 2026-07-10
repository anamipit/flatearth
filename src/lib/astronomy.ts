import { Equator, SiderealTime, Body, AstroTime, Observer, SearchGlobalSolarEclipse, NextGlobalSolarEclipse, SearchLunarEclipse, NextLunarEclipse, SearchLocalSolarEclipse, NextLocalSolarEclipse, MoonPhase as AstroMoonPhase, Illumination, SearchRiseSet, Horizon } from 'astronomy-engine';

const rad = Math.PI / 180;
const deg = 180 / Math.PI;

// Global Flat Earth Map Config
export const MAP_RADIUS = 20;

const defaultObserver = new Observer(0, 0, 0);

// Calculate Sun's Right Ascension and Declination
export function getSunPosition(date: Date) {
  const time = new AstroTime(date);
  const eq = Equator(Body.Sun, time, defaultObserver, true, true);
  return { ra: eq.ra * 15, dec: eq.dec }; // convert ra from hours to degrees
}

// Calculate Moon's Right Ascension and Declination
export function getMoonPosition(date: Date) {
  const time = new AstroTime(date);
  const eq = Equator(Body.Moon, time, defaultObserver, true, true);
  return { ra: eq.ra * 15, dec: eq.dec };
}

// Calculate Planet's Right Ascension and Declination
export function getPlanetPosition(bodyName: string, date: Date) {
  const time = new AstroTime(date);
  const body = (Body as any)[bodyName];
  if (!body) return null;
  const eq = Equator(body, time, defaultObserver, true, true);
  return { ra: eq.ra * 15, dec: eq.dec };
}

// Calculate Greenwich Mean Sidereal Time (GMST) in degrees
export function getGMST(date: Date) {
  const time = new AstroTime(date);
  const gmstHours = SiderealTime(time);
  return (gmstHours * 15) % 360;
}

// Convert RA/Dec to Geographic Subpoint (Latitude, Longitude)
export function getSubpoint(ra: number, dec: number, gmst: number) {
  const lat = dec;
  let lon = (ra - gmst);
  lon = (lon + 540) % 360 - 180; // Normalize to [-180, 180]
  return { lat, lon };
}

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
  const time = new AstroTime(date);
  
  // Phase angle (0 to 360)
  let phaseAngle = AstroMoonPhase(time);
  
  // Age of the moon (0 to 29.53 days)
  const age = (phaseAngle / 360) * 29.53058867;
  
  // Illumination percentage (0 to 100)
  const illum = Illumination(Body.Moon, time);
  const illumination = illum.phase_fraction * 100;
  
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
  const time = new AstroTime(startDate.getTime() + 86400000); // start 1 day ahead
  try {
    if (type === 'solar') {
      const eclipse = SearchGlobalSolarEclipse(time);
      return eclipse ? eclipse.peak.date : null;
    } else {
      const eclipse = SearchLunarEclipse(time);
      return eclipse ? eclipse.peak.date : null;
    }
  } catch (e) {
    return null;
  }
}

export function findEclipsesInRange(startDate: Date, endDate: Date, type: 'solar' | 'lunar'): Date[] {
  let time = new AstroTime(startDate);
  const endTime = endDate.getTime();
  const eclipses: Date[] = [];
  
  try {
    if (type === 'solar') {
      let eclipse = SearchGlobalSolarEclipse(time);
      while (eclipse && eclipse.peak.date.getTime() < endTime) {
        eclipses.push(eclipse.peak.date);
        eclipse = NextGlobalSolarEclipse(eclipse.peak);
      }
    } else {
      let eclipse = SearchLunarEclipse(time);
      while (eclipse && eclipse.peak.date.getTime() < endTime) {
        eclipses.push(eclipse.peak.date);
        eclipse = NextLunarEclipse(eclipse.peak);
      }
    }
  } catch (e) {
    console.error("Error finding eclipses:", e);
  }
  
  return eclipses;
}

export function findLocalEclipsesInRange(startDate: Date, endDate: Date, type: 'solar' | 'lunar', lat: number, lon: number): Date[] {
  let time = new AstroTime(startDate);
  const endTime = endDate.getTime();
  const eclipses: Date[] = [];
  const obs = new Observer(lat, lon, 0);
  
  try {
    if (type === 'solar') {
      let eclipse = SearchLocalSolarEclipse(time, obs);
      while (eclipse && eclipse.peak.time.date.getTime() < endTime) {
        if (eclipse.peak.altitude > 0 || (eclipse.partial_begin && eclipse.partial_begin.altitude > 0) || (eclipse.partial_end && eclipse.partial_end.altitude > 0)) {
          eclipses.push(eclipse.peak.time.date);
        }
        eclipse = NextLocalSolarEclipse(eclipse.peak.time, obs);
      }
    } else {
      let eclipse = SearchLunarEclipse(time);
      while (eclipse && eclipse.peak.date.getTime() < endTime) {
        let eq = Equator(Body.Moon, eclipse.peak, obs, true, true);
        let hor = Horizon(eclipse.peak, obs, eq.ra, eq.dec, 'normal');
        if (hor.altitude > -5) { // Visible or close to horizon
          eclipses.push(eclipse.peak.date);
        }
        eclipse = NextLunarEclipse(eclipse.peak);
      }
    }
  } catch (e) {
    console.error("Error finding local eclipses:", e);
  }
  
  return eclipses;
}

export function getRiseSetTimes(date: Date, lat: number, lon: number) {
  const time = new AstroTime(date);
  const observer = new Observer(lat, lon, 0);
  
  try {
    const sunRise = SearchRiseSet(Body.Sun, observer, 1, time, 1);
    const sunSet = SearchRiseSet(Body.Sun, observer, -1, time, 1);
    const moonRise = SearchRiseSet(Body.Moon, observer, 1, time, 1);
    const moonSet = SearchRiseSet(Body.Moon, observer, -1, time, 1);
    
    return {
      sunRise: sunRise ? sunRise.date : null,
      sunSet: sunSet ? sunSet.date : null,
      moonRise: moonRise ? moonRise.date : null,
      moonSet: moonSet ? moonSet.date : null,
    };
  } catch (e) {
    console.error("Error calculating rise/set times:", e);
    return { sunRise: null, sunSet: null, moonRise: null, moonSet: null };
  }
}

