const fs = require('fs');

const content = fs.readFileSync('src/lib/astronomy.ts', 'utf8');

const newStats = `export function getPlanetStats(date: Date, observerLat?: number, observerLon?: number) {
  const time = new AstroTime(date);
  const sunPos = SunPosition(time);
  const obs = (observerLat !== undefined && observerLon !== undefined) ? new Observer(observerLat, observerLon, 0) : defaultObserver;
  
  const planets = [Body.Mercury, Body.Venus, Body.Mars, Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune, Body.Moon];
  const planetStats = planets.map(body => {
    const eq = Equator(body, time, defaultObserver, true, true);
    let illum, angle = 0, elong = 0;
    
    if (body !== Body.Moon) {
      illum = Illumination(body, time);
      angle = AngleFromSun(body, time);
      const elongData = Elongation(body, time);
      elong = elongData.elongation;
    } else {
      illum = Illumination(Body.Moon, time);
      const phaseAngle = AstroMoonPhase(time);
      elong = phaseAngle; // use phase as approx elongation for moon just for stats
    }
    
    const constel = Constellation(eq.ra, eq.dec);
    
    let hor = null;
    if (observerLat !== undefined && observerLon !== undefined) {
      hor = Horizon(time, obs, eq.ra, eq.dec, 'normal');
    }
    
    // For Jupiter moons
    let moons = null;
    if (body === Body.Jupiter) {
      moons = JupiterMoons(time);
    }

    return {
      name: body,
      mag: illum.mag,
      angle: angle,
      elongation: elong,
      constellation: constel.name,
      azimuth: hor ? hor.azimuth : null,
      altitude: hor ? hor.altitude : null,
      distanceKm: body === Body.Moon ? eq.dist * 149597870.7 : null, // eq.dist is in AU
      illumination: body === Body.Moon ? illum.phase_fraction * 100 : null,
      moons: moons
    };
  });
  
  return {
    sun: {
      elon: sunPos.elon,
      elat: sunPos.elat
    },
    planets: planetStats
  };
}
`;

const lines = content.split('\n');
let startIdx = lines.findIndex(l => l.startsWith('export function getPlanetStats(date: Date) {'));
let endIdx = startIdx;
while (endIdx < lines.length && !lines[endIdx].startsWith('export function getPlanetEvents')) {
  endIdx++;
}

lines.splice(startIdx, endIdx - startIdx, newStats);

fs.writeFileSync('src/lib/astronomy.ts', lines.join('\n'));
console.log("Updated getPlanetStats");
