import { Constellation, Body, AstroTime, Equator, Observer } from 'astronomy-engine';
const time = new AstroTime(new Date());
const obs = new Observer(0,0,0);
const eq = Equator(Body.Sun, time, obs, true, true);
console.log(Constellation(eq.ra, eq.dec));
