import React, { useState, useEffect, useRef } from 'react';
import { Plane, Search, MapPin, Loader2, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';
import { getAngularDistance } from '../lib/astronomy';

// Globe distance using haversine formula
function getGreatCircleDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Flat earth straight line distance based on Azimuthal Equidistant map projection
// where radial distance from North Pole is proportional to colatitude
function getFlatEarthDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Convert to flat earth polar coordinates
  // r is proportional to colatitude. If equator is 10000km from pole, then r = (90 - lat) * (10000/90) approx 111.1km per degree
  const kmPerDegree = 111.111;
  const r1 = (90 - lat1) * kmPerDegree;
  const r2 = (90 - lat2) * kmPerDegree;
  const theta1 = lon1 * Math.PI / 180;
  const theta2 = lon2 * Math.PI / 180;
  
  // Convert to cartesian for distance calculation
  const x1 = r1 * Math.cos(theta1);
  const y1 = r1 * Math.sin(theta1);
  const x2 = r2 * Math.cos(theta2);
  const y2 = r2 * Math.sin(theta2);
  
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function LocationSearchInput({ 
  placeholder, 
  value, 
  onChange 
}: { 
  placeholder: string; 
  value: any; 
  onChange: (loc: any) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
        const data = await res.json();
        setResults(data);
      } catch (e) {
        console.error('Failed to search location', e);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (item: any) => {
    onChange({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      name: item.display_name.split(',')[0],
    });
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative font-sans" ref={wrapperRef}>
      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5">
        <Search size={10} className="text-zinc-400 min-w-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={value ? value.name : placeholder}
          className="bg-transparent border-none outline-none text-[10px] text-zinc-100 w-full px-1 placeholder:text-zinc-500"
        />
        {isSearching && <Loader2 size={10} className="text-zinc-400 animate-spin" />}
        {value && !query && (
          <button onClick={() => onChange(null)} className="p-0.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X size={10} />
          </button>
        )}
      </div>

      {isOpen && (query.trim().length >= 3 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden shadow-xl z-50">
          {results.length > 0 ? (
            <ul className="max-h-40 overflow-y-auto custom-scrollbar py-1">
              {results.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-2 py-1.5 hover:bg-zinc-800 transition-colors flex items-start gap-1 border-b border-zinc-800/50 last:border-0"
                  >
                    <MapPin size={10} className="text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[9px] font-medium text-zinc-200 line-clamp-1">{item.display_name.split(',')[0]}</div>
                      <div className="text-[9px] text-zinc-500 line-clamp-1">{item.display_name}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 3 && !isSearching ? (
            <div className="p-2 text-center text-[9px] text-zinc-500">
              Tidak ditemukan.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function FlightRoutePanel() {
  const { 
    showFlightPanel, 
    setShowFlightPanel, 
    routeDeparture, 
    routeArrival, 
    setRouteDeparture, 
    setRouteArrival 
  } = useSimulation();

  if (!showFlightPanel) return null;

  let greatCircleDist = 0;
  let flatEarthDist = 0;
  
  if (routeDeparture && routeArrival) {
    greatCircleDist = getGreatCircleDistance(
      routeDeparture.lat, routeDeparture.lon, 
      routeArrival.lat, routeArrival.lon
    );
    flatEarthDist = getFlatEarthDistance(
      routeDeparture.lat, routeDeparture.lon, 
      routeArrival.lat, routeArrival.lon
    );
  }

  const planeSpeed = 900; // km/h commercial jet
  const formatTime = (dist: number) => {
    const hours = dist / planeSpeed;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}j ${m}m`;
  };

  return (
    <div className="absolute top-4 right-1/2 translate-x-[40%] z-20 w-64 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-2xl font-sans">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[11px] font-medium text-zinc-100 flex items-center gap-1.5">
          <Plane size={12} className="text-blue-400" />
          Rute Penerbangan
        </h2>
        <button onClick={() => setShowFlightPanel(false)} className="text-zinc-500 hover:text-white transition-colors">
          <X size={12} />
        </button>
      </div>

      <div className="space-y-2 relative">
        <div className="absolute left-2.5 top-5 bottom-5 w-0.5 bg-zinc-800/80 z-0"></div>
        <div className="relative z-10">
          <div className="text-[9px] text-zinc-500 mb-0.5 pl-5">Keberangkatan</div>
          <LocationSearchInput 
            placeholder="Cari bandara/kota..." 
            value={routeDeparture} 
            onChange={setRouteDeparture} 
          />
        </div>
        <div className="relative z-10">
          <div className="text-[9px] text-zinc-500 mb-0.5 pl-5">Kedatangan</div>
          <LocationSearchInput 
            placeholder="Cari bandara/kota..." 
            value={routeArrival} 
            onChange={setRouteArrival} 
          />
        </div>
      </div>

      {routeDeparture && routeArrival && (
        <div className="mt-4 space-y-2">
          <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
            <div className="text-[9px] font-medium text-zinc-400 border-b border-zinc-800/50 pb-1 mb-1 flex items-center justify-between">
              <span>Globe (Great Circle)</span>
              <span className="text-emerald-400">Realita</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[9px] text-zinc-500">Jarak Tempuh</div>
                <div className="font-mono text-xs text-zinc-200">{Math.round(greatCircleDist).toLocaleString()} km</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-zinc-500">Waktu (900km/j)</div>
                <div className="font-mono text-[10px] text-emerald-400">{formatTime(greatCircleDist)}</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
            <div className="text-[9px] font-medium text-zinc-400 border-b border-zinc-800/50 pb-1 mb-1 flex items-center justify-between">
              <span>Flat Earth (Garis Lurus)</span>
              <AlertTriangle size={10} className="text-orange-400" />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[9px] text-zinc-500">Jarak Tempuh</div>
                <div className="font-mono text-xs text-zinc-200">{Math.round(flatEarthDist).toLocaleString()} km</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-zinc-500">Waktu (900km/j)</div>
                <div className="font-mono text-[10px] text-orange-400">{formatTime(flatEarthDist)}</div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-zinc-500 mt-2 text-center flex items-center justify-center gap-1 bg-zinc-900/30 p-1.5 rounded border border-zinc-800/30">
            <ArrowRight size={10} className="text-zinc-600" />
            <span>Selisih Distorsi: <strong className="text-zinc-300 font-mono">{Math.round(Math.abs(flatEarthDist - greatCircleDist)).toLocaleString()} km</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
