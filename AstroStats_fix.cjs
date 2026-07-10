const fs = require('fs');

let code = fs.readFileSync('src/components/AstroStats.tsx', 'utf8');

code = code.replace(
  /const \[stats, setStats\] = useState<any>\(null\);\n\n  useEffect\(\(\) => \{\n    const data = getPlanetStats\([\s\S]*?\);\n    setStats\(data\);\n  \}, \[currentTime, targetLocation\]\);/m,
  `const stats = React.useMemo(() => getPlanetStats(
      new Date(currentTime), 
      targetLocation ? targetLocation.lat : undefined, 
      targetLocation ? targetLocation.lon : undefined
    ), [currentTime, targetLocation]);`
);

fs.writeFileSync('src/components/AstroStats.tsx', code);
