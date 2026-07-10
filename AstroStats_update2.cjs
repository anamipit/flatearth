const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { Activity, X, MapPin } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';
import { getPlanetStats } from '../lib/astronomy';

export function AstroStats() {
  const { currentTime, selectedPlanet, setSelectedPlanet, targetLocation } = useSimulation();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const data = getPlanetStats(
      new Date(currentTime), 
      targetLocation ? targetLocation.lat : undefined, 
      targetLocation ? targetLocation.lon : undefined
    );
    setStats(data);
  }, [currentTime, targetLocation]);

  if (!stats || !selectedPlanet) return null;

  const planetData = stats.planets.find((p: any) => p.name === selectedPlanet);
  if (!planetData) return null;

  const getLocalName = (name: string) => {
    const map: Record<string, string> = {
      'Sun': 'Matahari',
      'Mercury': 'Merkurius',
      'Venus': 'Venus',
      'Mars': 'Mars',
      'Jupiter': 'Yupiter',
      'Saturn': 'Saturnus',
      'Uranus': 'Uranus',
      'Neptune': 'Neptunus',
      'Moon': 'Bulan'
    };
    return map[name] || name;
  };

  return (
    <div className="absolute bottom-6 left-6 z-10 font-sans">
      <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl w-64 overflow-hidden flex flex-col max-h-[60vh]">
        <div className="flex items-center justify-between p-3 border-b border-zinc-800/80 bg-zinc-900/80">
          <h2 className="text-sm font-medium text-white flex items-center gap-2">
            <Activity size={14} className={selectedPlanet === 'Moon' ? 'text-indigo-400' : (selectedPlanet === 'Sun' ? 'text-yellow-400' : 'text-emerald-400')} />
            Data {getLocalName(planetData.name)}
          </h2>
          <button onClick={() => setSelectedPlanet(null)} className="text-zinc-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        
        <div className="p-2 overflow-y-auto custom-scrollbar text-xs text-zinc-300 space-y-2">
          <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
            <div className="text-emerald-400 font-medium mb-1.5 border-b border-zinc-800 pb-1">Statistik Umum</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-mono text-[10px]">
              {planetData.mag !== undefined && <><span className="text-zinc-500">Magnitudo:</span> <span>{planetData.mag.toFixed(2)}</span></>}
              {planetData.name !== 'Sun' && planetData.elongation !== undefined && <><span className="text-zinc-500">Elongasi:</span> <span>{planetData.elongation.toFixed(1)}°</span></>}
              {planetData.name !== 'Sun' && planetData.name !== 'Moon' && planetData.angle !== undefined && planetData.angle > 0 && <><span className="text-zinc-500">Sudut (S):</span> <span>{planetData.angle.toFixed(1)}°</span></>}
              <span className="text-zinc-500">Rasi Bintang:</span> <span className="text-yellow-400 truncate" title={planetData.constellation}>{planetData.constellation}</span>
            </div>
          </div>

          {targetLocation && planetData.azimuth !== null && planetData.altitude !== null && (
            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
              <div className="text-blue-400 font-medium mb-1.5 border-b border-zinc-800 pb-1 flex items-center gap-1">
                <MapPin size={10} /> Di {targetLocation.name}
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-mono text-[10px]">
                <span className="text-zinc-500">Azimuth:</span> <span>{planetData.azimuth.toFixed(2)}°</span>
                <span className="text-zinc-500">Altitude:</span> <span className={planetData.altitude > 0 ? 'text-emerald-400' : 'text-red-400'}>{planetData.altitude.toFixed(2)}°</span>
              </div>
            </div>
          )}

          {(planetData.name === 'Moon' || planetData.name === 'Sun') && (
            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
              <div className="text-indigo-400 font-medium mb-1.5 border-b border-zinc-800 pb-1">Detail Fisik</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-mono text-[10px]">
                {planetData.name === 'Moon' && <><span className="text-zinc-500">Iluminasi:</span> <span>{planetData.illumination.toFixed(1)}%</span></>}
                <span className="text-zinc-500">Jarak:</span> <span>{Math.round(planetData.distanceKm).toLocaleString()} km</span>
              </div>
            </div>
          )}

          {planetData.name === 'Jupiter' && planetData.moons && (
            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
              <div className="text-orange-400 font-medium mb-1.5 border-b border-zinc-800 pb-1">Satelit Galilean (Posisi X)</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-mono text-[10px]">
                <span className="text-zinc-500">Io:</span> <span className={planetData.moons.io.x > 0 ? 'text-emerald-400' : 'text-red-400'}>{planetData.moons.io.x.toFixed(4)} AU</span>
                <span className="text-zinc-500">Europa:</span> <span className={planetData.moons.europa.x > 0 ? 'text-emerald-400' : 'text-red-400'}>{planetData.moons.europa.x.toFixed(4)} AU</span>
                <span className="text-zinc-500">Ganymede:</span> <span className={planetData.moons.ganymede.x > 0 ? 'text-emerald-400' : 'text-red-400'}>{planetData.moons.ganymede.x.toFixed(4)} AU</span>
                <span className="text-zinc-500">Callisto:</span> <span className={planetData.moons.callisto.x > 0 ? 'text-emerald-400' : 'text-red-400'}>{planetData.moons.callisto.x.toFixed(4)} AU</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AstroStats.tsx', code);
