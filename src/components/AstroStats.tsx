import React, { useState, useEffect } from 'react';
import { Activity, X } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';
import { getPlanetStats } from '../lib/astronomy';

export function AstroStats() {
  const { currentTime, selectedPlanet, setSelectedPlanet } = useSimulation();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const data = getPlanetStats(new Date(currentTime));
    setStats(data);
  }, [currentTime]);

  if (!stats || !selectedPlanet) return null;

  const planetData = stats.planets.find((p: any) => p.name === selectedPlanet);
  if (!planetData) return null;

  const getLocalName = (name: string) => {
    const map: Record<string, string> = {
      'Mercury': 'Merkurius',
      'Venus': 'Venus',
      'Mars': 'Mars',
      'Jupiter': 'Yupiter',
      'Saturn': 'Saturnus',
      'Uranus': 'Uranus',
      'Neptune': 'Neptunus'
    };
    return map[name] || name;
  };

  return (
    <div className="absolute bottom-6 left-6 z-10 font-sans">
      <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl w-64 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-zinc-800/80 bg-zinc-900/80">
          <h2 className="text-sm font-medium text-white flex items-center gap-2">
            <Activity size={14} className="text-emerald-400" />
            Data {getLocalName(planetData.name)}
          </h2>
          <button onClick={() => setSelectedPlanet(null)} className="text-zinc-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        
        <div className="p-3 text-xs text-zinc-300">
          <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-mono text-[11px]">
              <span className="text-zinc-500">Magnitudo:</span> <span>{planetData.mag.toFixed(2)}</span>
              <span className="text-zinc-500">Elongasi:</span> <span>{planetData.elongation.toFixed(1)}°</span>
              <span className="text-zinc-500">Sudut (S):</span> <span>{planetData.angle.toFixed(1)}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
