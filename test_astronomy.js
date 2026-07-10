const { Astronomy, Body, MakeObserver } = require('astronomy-engine');

const date = new Date();
const observer = MakeObserver(0, 0, 0);
const sunEq = Astronomy.Equator(Body.Sun, date, observer, true, true);
console.log("Sun:", sunEq.ra, sunEq.dec);

const moonEq = Astronomy.Equator(Body.Moon, date, observer, true, true);
console.log("Moon:", moonEq.ra, moonEq.dec);

const gmst = Astronomy.SiderealTime(date); // sidereal time in hours
console.log("GMST hours:", gmst, "degrees:", gmst * 15);
