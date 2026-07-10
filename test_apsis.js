import { SearchLunarApsis, NextLunarApsis, AstroTime } from 'astronomy-engine';
console.log(typeof SearchLunarApsis);
let mq = SearchLunarApsis(new AstroTime(new Date()));
console.log(mq.time.date, mq.kind); // kind is 0 for perigee, 1 for apogee
