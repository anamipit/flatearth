import { SearchTransit, Body, AstroTime } from 'astronomy-engine';
const time = new AstroTime(new Date());
const trans = SearchTransit(Body.Mercury, time);
console.log(trans);
