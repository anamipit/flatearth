import { SearchMoonQuarter, NextMoonQuarter, AstroTime } from 'astronomy-engine';
console.log(typeof NextMoonQuarter);
let time = new AstroTime(new Date());
let mq = SearchMoonQuarter(time);
console.log(mq.time.date, mq.quarter);
mq = NextMoonQuarter(mq);
console.log(mq.time.date, mq.quarter);
