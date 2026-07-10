import { Seasons, SearchMoonQuarter, AstroTime } from 'astronomy-engine';
const year = 2026;
const seasons = Seasons(year);
console.log(seasons.mar_equinox.date);
console.log(seasons.jun_solstice.date);
const nxtQ = SearchMoonQuarter(new AstroTime(new Date()));
console.log(nxtQ.time.date, nxtQ.quarter);
