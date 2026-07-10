const Astronomy = require('astronomy-engine');

const d = new Date('2026-07-10T00:00:00Z');
let time = new Astronomy.AstroTime(d);
console.log(Astronomy.SearchGlobalSolarEclipse(time).peak.date);
console.log(Astronomy.NextGlobalSolarEclipse(time).peak.date);
