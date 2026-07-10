import React from 'react';
import { Play, Pause, Rewind, FastForward } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';
import { format } from 'date-fns';

export function PlaybackControls() {
  const { currentTime, speedMultiplier, isPlaying, setSpeedMultiplier, togglePlay, targetLocation } = useSimulation();

  const speeds = [
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 60, label: '1 mnt/d' },
    { value: 3600, label: '1 jam/d' },
    { value: 86400, label: '1 hari/d' },
  ];

  const date = new Date(currentTime);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatUTC = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;

  let localTimeDisplay = null;
  if (targetLocation) {
    const tzOffsetHours = Math.round(targetLocation.lon / 15);
    const localTimeMs = currentTime + (tzOffsetHours * 3600 * 1000);
    const localDate = new Date(localTimeMs);
    const offsetStr = tzOffsetHours >= 0 ? `+${tzOffsetHours}` : `${tzOffsetHours}`;
    
    localTimeDisplay = (
      <div className="flex items-center gap-2 border-l border-zinc-700 pl-4 ml-2 whitespace-nowrap">
        <div className="text-xs text-zinc-400">Lokal ({targetLocation.name}, UTC{offsetStr}):</div>
        <div className="text-base font-mono text-blue-400 font-medium">
          {formatUTC(localDate)}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 font-sans flex flex-col items-center gap-3">
      {/* Time Info */}
      <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-full px-6 py-2 shadow-xl flex items-center justify-center max-w-[95vw] overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="text-xs text-zinc-400">Simulasi (UTC):</div>
          <div className="text-base font-mono text-emerald-400 font-medium">
            {formatUTC(date)}
          </div>
        </div>
        {localTimeDisplay}
      </div>

      <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-full py-2 px-4 shadow-2xl flex items-center gap-4">
        
        {/* Rewind Controls */}
        <div className="flex items-center gap-1">
          <div className="text-zinc-500 mr-2 flex items-center justify-center">
            <Rewind size={14} />
          </div>
          {[...speeds].reverse().map(({ value, label }) => (
            <button
              key={`rev-${value}`}
              onClick={() => setSpeedMultiplier(-value)}
              className={`text-[11px] font-medium px-2 py-1.5 rounded-full transition-colors whitespace-nowrap
                ${speedMultiplier === -value ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
            >
              -{label}
            </button>
          ))}
        </div>

        {/* Play/Pause */}
        <div className="w-px h-8 bg-zinc-800 mx-1"></div>
        <button 
          onClick={togglePlay} 
          className="flex items-center justify-center w-10 h-10 bg-zinc-100 hover:bg-white text-zinc-900 rounded-full transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
        </button>
        <div className="w-px h-8 bg-zinc-800 mx-1"></div>

        {/* Forward Controls */}
        <div className="flex items-center gap-1">
          {speeds.map(({ value, label }) => (
            <button
              key={`fwd-${value}`}
              onClick={() => setSpeedMultiplier(value)}
              className={`text-[11px] font-medium px-2 py-1.5 rounded-full transition-colors whitespace-nowrap
                ${speedMultiplier === value ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
            >
              {label}
            </button>
          ))}
          <div className="text-zinc-500 ml-2 flex items-center justify-center">
            <FastForward size={14} />
          </div>
        </div>
        
      </div>
    </div>
  );
}
