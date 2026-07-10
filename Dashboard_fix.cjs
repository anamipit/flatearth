const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  /const \[riseSetTimes, setRiseSetTimes\] = useState[\s\S]*?\}, \[targetLocation, date\.getUTCDate\(\), date\.getUTCMonth\(\), date\.getUTCFullYear\(\)\]\);/m,
  `const riseSetTimes = React.useMemo(() => {
    if (targetLocation) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0,0,0,0);
      return getRiseSetTimes(startOfDay, targetLocation.lat, targetLocation.lon);
    }
    return null;
  }, [targetLocation, date.getUTCDate(), date.getUTCMonth(), date.getUTCFullYear()]);`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
