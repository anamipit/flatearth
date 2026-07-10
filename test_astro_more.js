const { Constellation, Body, AstroTime, JupiterMoons, SearchTransit, NextTransit } = require('astronomy-engine');

const time = new AstroTime(new Date());

const sunConst = Constellation(Body.Sun, time);
const moonConst = Constellation(Body.Moon, time);
const jupiterMoons = JupiterMoons(time);

console.log("Sun Constellation:", sunConst);
console.log("Moon Constellation:", moonConst);
console.log("Jupiter Moons (X, Y, Z relative to Jupiter in Jupiter radii):", jupiterMoons);

const transit = SearchTransit(Body.Mercury, time);
console.log("Next Mercury Transit:", transit ? transit.peak.date : "None found in near future");

