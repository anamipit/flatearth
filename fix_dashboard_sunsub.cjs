const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  `  const riseSetTimes = React.useMemo(() => {
    if (targetLocation) {
      const d = new Date(currentTime);
      const startOfDay = new Date(d);
      startOfDay.setUTCHours(0,0,0,0);
      return getRiseSetTimes(startOfDay, targetLocation.lat, targetLocation.lon);
    }
    return null;
  }, [targetLocation, new Date(currentTime).getUTCDate(), new Date(currentTime).getUTCMonth(), new Date(currentTime).getUTCFullYear()]);`,
  `  const date = new Date(currentTime);
  const gmst = getGMST(date);
  
  const sunPos = getSunPosition(date);
  const sunSub = getSubpoint(sunPos.ra, sunPos.dec, gmst);
  const planetStats = getPlanetStats(date);
  
  const moonPos = getMoonPosition(date);
  const moonSub = getSubpoint(moonPos.ra, moonPos.dec, gmst);

  const riseSetTimes = React.useMemo(() => {
    if (targetLocation) {
      const d = new Date(currentTime);
      const startOfDay = new Date(d);
      startOfDay.setUTCHours(0,0,0,0);
      return getRiseSetTimes(startOfDay, targetLocation.lat, targetLocation.lon);
    }
    return null;
  }, [targetLocation, new Date(currentTime).getUTCDate(), new Date(currentTime).getUTCMonth(), new Date(currentTime).getUTCFullYear()]);`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
