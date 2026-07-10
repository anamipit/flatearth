const Astronomy = require('astronomy-engine');

const d = new Date();
const time = new Astronomy.AstroTime(d);
const observer = new Astronomy.Observer(-6.917464, 107.619123, 0); // Bandung

const sunRise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, time, 1);
const sunSet = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, time, 1);
const moonRise = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, 1, time, 1);
const moonSet = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, time, 1);

console.log("Sun Rise:", sunRise ? sunRise.date : "None");
console.log("Sun Set:", sunSet ? sunSet.date : "None");
console.log("Moon Rise:", moonRise ? moonRise.date : "None");
console.log("Moon Set:", moonSet ? moonSet.date : "None");
