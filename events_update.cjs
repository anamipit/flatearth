const fs = require('fs');
let code = fs.readFileSync('src/lib/astronomy.ts', 'utf8');

const newEvents = `export function getPlanetEvents(startDate: Date) {
  const time = new AstroTime(startDate);
  const events = [];
  const planets = [Body.Mercury, Body.Venus, Body.Mars, Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune];
  
  try {
    // Moon Node
    try {
      const node = SearchMoonNode(time);
      events.push({ body: 'Bulan', type: 'Titik Simpul (Node)', date: node.time.date, details: node.kind === 0 ? 'Menaik (Ascending)' : 'Menurun (Descending)' });
    } catch (e) {}

    for (const body of planets) {
      // Apsis
      try {
        const apsis = SearchPlanetApsis(body, time);
        events.push({ body, type: 'Apsis', date: apsis.time.date, details: apsis.kind === 0 ? 'Perihelion (Terdekat)' : 'Aphelion (Terjauh)' });
      } catch (e) {}

      // Max Elongation (only for inner planets)
      if (body === Body.Mercury || body === Body.Venus) {
        try {
          const maxElong = SearchMaxElongation(body, time);
          events.push({ body, type: 'Max Elongation', date: maxElong.time.date, details: maxElong.visibility === 'morning' ? 'Pagi (Barat)' : 'Sore (Timur)' });
        } catch (e) {}
        
        // Transits
        try {
          const trans = SearchTransit(body, time);
          if (trans) {
            events.push({ body, type: 'Transit', date: trans.peak.time.date, details: 'Transit Melintasi Matahari' });
          }
        } catch (e) {}
      }

      // Opposition & Conjunction (for outer planets, opposition is possible)
      if (body !== Body.Mercury && body !== Body.Venus) {
        try {
          const opp = SearchRelativeLongitude(body, 180, time);
          events.push({ body, type: 'Oposisi', date: opp.date, details: 'Terlihat Sepanjang Malam' });
        } catch (e) {}
      }
      
      try {
        const conj = SearchRelativeLongitude(body, 0, time);
        events.push({ body, type: 'Konjungsi', date: conj.date, details: 'Tertutup Matahari' });
      } catch (e) {}
    }
    
    // Sort by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (e) {
    return [];
  }
}
`;

const lines = code.split('\n');
let startIdx = lines.findIndex(l => l.startsWith('export function getPlanetEvents(startDate: Date'));
let endIdx = lines.length;

lines.splice(startIdx, endIdx - startIdx, newEvents);

fs.writeFileSync('src/lib/astronomy.ts', lines.join('\n'));
