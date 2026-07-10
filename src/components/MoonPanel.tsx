import React, { useState } from 'react';
import { useSimulation } from '../store/useSimulation';
import { getMoonPhase, getMoonPosition, getGMST, getSubpoint } from '../lib/astronomy';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
  const { currentTime } = useSimulation();
  const date = new Date(currentTime);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const { phaseAngle, age, illumination, phaseName } = getMoonPhase(date);
  
  const moonPos = getMoonPosition(date);
  const moonSub = getSubpoint(moonPos.ra, moonPos.dec, getGMST(date));

  return (
    <div className="absolute top-4 right-4 z-10 w-72 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl p-5 text-zinc-100 shadow-2xl font-sans transition-all duration-300">
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
        <div className="space-y-3">
          <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center">
            <span className="text-xs text-zinc-400">Usia Kalender Lunar</span>
            <span className="font-mono text-sm text-blue-200">{age.toFixed(1)} Hari</span>
          </div>
          
          <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center">
            <span className="text-xs text-zinc-400">Iluminasi</span>
            <span className="font-mono text-sm text-blue-200">{illumination.toFixed(1)}%</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
              <div className="text-xs text-zinc-400 mb-1">Ketinggian (Deklinasi)</div>
              <div className="font-mono text-sm text-blue-200">
                {Math.abs(moonSub.lat).toFixed(2)}° {moonSub.lat >= 0 ? 'Utara' : 'Selatan'}
              </div>
            </div>
            
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
              <div className="text-xs text-zinc-400 mb-1">Derajat Sudut</div>
              <div className="font-mono text-sm text-blue-200">
                {phaseAngle.toFixed(1)}°
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
