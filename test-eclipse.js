import { findEclipsesInRange } from './src/lib/astronomy.js';
const start = new Date('1960-01-01');
const end = new Date('2040-01-01');
console.time('findEclipses');
const e = findEclipsesInRange(start, end, 'solar');
console.timeEnd('findEclipses');
console.log(e.length);
