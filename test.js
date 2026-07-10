import { AstroTime, Observer, SearchLunarEclipse, Equator, Horizon, Body } from 'astronomy-engine';
const obs = new Observer(-6.2, 106.8, 0);
const time = new AstroTime(new Date());
let evt = SearchLunarEclipse(time);
let eq = Equator(Body.Moon, evt.peak, obs, true, true);
let hor = Horizon(evt.peak, obs, eq.ra, eq.dec, 'normal');
console.log("Peak Alt:", hor.altitude);
