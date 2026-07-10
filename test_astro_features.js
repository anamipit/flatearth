import { Constellation, Body, AstroTime, Equator, Observer, JupiterMoons, Horizon, SearchTransit, SearchMoonNode, Illumination } from 'astronomy-engine';
const time = new AstroTime(new Date());
const obs = new Observer(-6.2, 106.8, 0); // Jakarta
const eq = Equator(Body.Jupiter, time, obs, true, true);
console.log("Const:", Constellation(eq.ra, eq.dec));
console.log("Jup Moons:", JupiterMoons(time));
const hor = Horizon(time, obs, eq.ra, eq.dec, 'normal');
console.log("AzAlt:", hor.azimuth, hor.altitude);
console.log("Dist AU:", eq.dist);
const node = SearchMoonNode(time);
console.log("Moon Node:", node.time.date);
const trans = SearchTransit(Body.Mercury, time);
console.log("Mercury Transit:", trans ? trans.peak.time.date : null);
