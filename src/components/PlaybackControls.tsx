import React from 'react';
import { Play, Pause, Rewind, FastForward } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';

export function PlaybackControls() {
  const { speedMultiplier, isPlaying, setSpeedMultiplier, togglePlay } = useSimulation();

  const speeds = [
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 60, label: '1 mnt/d' },
    { value: 3600, label: '1 jam/d' },
    { value: 86400, label: '1 hari/d' },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 font-sans">
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
