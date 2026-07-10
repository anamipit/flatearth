import { SearchPlanetApsis, NextPlanetApsis, Body, AstroTime, Illumination, SearchPeakMagnitude, AngleFromSun, Elongation, SearchMaxElongation, SearchRelativeLongitude, SunPosition } from 'astronomy-engine';

let time = new AstroTime(new Date());

// Planet Apsis
let planetApsis = SearchPlanetApsis(Body.Venus, time);
console.log("Venus Apsis:", planetApsis.time.date, planetApsis.kind);

// Visual magnitude
let illum = Illumination(Body.Venus, time);
console.log("Venus Magnitude:", illum.mag);

// Peak magnitude
let peakMag = SearchPeakMagnitude(Body.Venus, time);
console.log("Venus Peak Mag:", peakMag.time.date);

// AngleFromSun
let angle = AngleFromSun(Body.Venus, time);
console.log("Venus Angle from Sun:", angle);

// Elongation
let elong = Elongation(Body.Venus, time);
console.log("Venus Elongation:", elong.elongation, elong.ecliptic_separation);

// Max elongation
let maxElong = SearchMaxElongation(Body.Venus, time);
console.log("Venus Max Elongation:", maxElong.time.date, maxElong.visibility);

// Opposition
// target_rel_lon is 180 for opposition, 0 for conjunction.
let opp = SearchRelativeLongitude(Body.Mars, 180, time);
console.log("Mars Opposition:", opp.date);

let conj = SearchRelativeLongitude(Body.Mars, 0, time);
console.log("Mars Conjunction:", conj.date);

let sunPos = SunPosition(time);
console.log("Sun Position:", sunPos);
