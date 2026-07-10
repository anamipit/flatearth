import React, { useState } from 'react';
import { useSimulation } from '../store/useSimulation';
import { getMoonPhase, getMoonPosition, getGMST, getSubpoint } from '../lib/astronomy';
import { ChevronUp, ChevronDown, Moon } from 'lucide-react';
import { EclipseTableModal } from './EclipseTableModal';

const MoonPhaseSVG = ({ phaseAngle }: { phaseAngle: number }) => {
  const isWaxing = phaseAngle <= 180;
  const illum = (1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2;
  
  const r = 48;
  const rx = r * Math.abs(1 - illum * 2);
  
  const sweepOuter = isWaxing ? 1 : 0;
  const sweepTerminator = illum > 0.5 ? sweepOuter : (1 - sweepOuter);
  
  // Outer arc: top (50, 2) to bottom (50, 98)
  // Terminator arc: bottom (50, 98) back to top (50, 2)
  const d = `
    M 50 2 
    A ${r} ${r} 0 0 ${sweepOuter} 50 98
    A ${rx} ${r} 0 0 ${sweepTerminator} 50 2
    Z
  `;

  return (
    <svg viewBox="0 0 100 100" className="w-14 h-14 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
      <circle cx="50" cy="50" r="48" fill="#18181b" stroke="#27272a" strokeWidth="2" />
      <path d={d} fill="#f4f4f5" />
    </svg>
  );
};

export function MoonPanel() {
  const { currentTime, moonScale, moonHeight, setMoonScale, setMoonHeight } = useSimulation();
  const date = new Date(currentTime);
  const [isMinimized, setIsMinimized] = useState(false);
  const [eclipseModal, setEclipseModal] = useState<'solar' | 'lunar' | null>(null);
  
  const { phaseAngle, age, illumination, phaseName } = getMoonPhase(date);
  
  const moonPos = getMoonPosition(date);
  const moonSub = getSubpoint(moonPos.ra, moonPos.dec, getGMST(date));

  const formatCoord = (val: number, isLat: boolean) => {
    const dir = isLat ? (val >= 0 ? 'U' : 'S') : (val >= 0 ? 'T' : 'B');
    return `${Math.abs(val).toFixed(2)}° ${dir}`;
  };

  const formatRA = (raDeg: number) => {
    const hours = raDeg / 15;
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    const s = Math.floor((((hours % 1) * 60) % 1) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-10 w-80 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl p-5 text-zinc-100 shadow-2xl font-sans transition-all duration-300">
        <div className={`flex items-start justify-between ${isMinimized ? '' : 'mb-4'}`}>
          <div className="flex items-center gap-4">
            <MoonPhaseSVG phaseAngle={phaseAngle} />
            <div>
              <h2 className="text-lg font-medium text-white leading-tight">{phaseName}</h2>
              <div className="text-xs text-zinc-400">
                Fase Bulan
              </div>
            </div>
          </div>
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors mt-1" title={isMinimized ? "Perbesar" : "Perkecil"}>
            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
        
        {!isMinimized && (
          <div className="space-y-4">
            {/* Phase stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-400">Usia (Hari)</span>
                <span className="font-mono text-xs text-blue-200">{age.toFixed(1)}</span>
              </div>
              
              <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-400">Iluminasi</span>
                <span className="font-mono text-xs text-blue-200">{illumination.toFixed(1)}%</span>
              </div>

              <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-400">Sudut (°)</span>
                <span className="font-mono text-xs text-blue-200">{phaseAngle.toFixed(1)}°</span>
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-100 shadow-[0_0_8px_rgba(219,234,254,0.8)]"></span>
                  Titik Sublunar
                </div>
                <div className="font-mono text-xs space-y-1">
                  <div>Lat: {formatCoord(moonSub.lat, true)}</div>
                  <div>Lon: {formatCoord(moonSub.lon, false)}</div>
                </div>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span>
                  Astronomis
                </div>
                <div className="font-mono text-xs space-y-1">
                  <div>RA: {formatRA(moonPos.ra)}</div>
                  <div>Dec: {formatCoord(moonPos.dec, true)}</div>
                </div>
              </div>
            </div>
            
            {/* Eclipse Finders */}
            <button onClick={() => setEclipseModal('lunar')} className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-xs py-2 rounded-md transition-colors border border-zinc-700">
              <Moon size={12} className="text-red-400" />
              Gerhana Bulan
            </button>

            {/* Scale Controls */}
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Ukuran Bulan</span>
                  <span className="font-mono">{moonScale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" max="5" step="0.1" 
                  value={moonScale} 
                  onChange={(e) => setMoonScale(parseFloat(e.target.value))}
                  className="w-full accent-blue-200 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Ketinggian Bulan</span>
                  <span className="font-mono">{moonHeight.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="10" step="0.1" 
                  value={moonHeight} 
                  onChange={(e) => setMoonHeight(parseFloat(e.target.value))}
                  className="w-full accent-blue-200 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {eclipseModal && (
        <EclipseTableModal 
          type={eclipseModal} 
          onClose={() => setEclipseModal(null)} 
        />
      )}
    </>
  );
}
