const Astronomy = require('astronomy-engine');

const date = new Date();
const time = new Astronomy.AstroTime(date);
const observer = new Astronomy.Observer(0, 0, 0); // e.g. equator

// SearchRiseSet(body, observer, direction, startTime, limitDays)
// direction: +1 for rise, -1 for set
try {
  let rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, time, 1);
  console.log("Sun Rise:", rise ? rise.date : "None");
} catch (e) {
  console.log(e);
}
