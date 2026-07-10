const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// I will fix the date usage by changing `date` to `new Date(currentTime)` in the useMemo.
code = code.replace(
  /const riseSetTimes = React\.useMemo\(\(\) => \{\n    if \(targetLocation\) \{\n      const startOfDay = new Date\(date\);\n      startOfDay\.setUTCHours\(0,0,0,0\);\n      return getRiseSetTimes\(startOfDay, targetLocation\.lat, targetLocation\.lon\);\n    \}\n    return null;\n  \}, \[targetLocation, date\.getUTCDate\(\), date\.getUTCMonth\(\), date\.getUTCFullYear\(\)\]\);/m,
  `const riseSetTimes = React.useMemo(() => {
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
