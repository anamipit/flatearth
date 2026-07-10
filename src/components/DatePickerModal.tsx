import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';

export function DatePickerModal({ onClose }: { onClose: () => void }) {
  const { currentTime, setCurrentTime, togglePlay, isPlaying, targetLocation } = useSimulation();
  
  // Format the current time to YYYY-MM-DDThh:mm string as UTC
  const dateObj = new Date(currentTime);
  const isoString = dateObj.toISOString().slice(0, 16); 
  
  const [datetime, setDatetime] = useState(isoString);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTime = new Date(datetime + ':00Z').getTime(); // Append :00Z to treat as UTC
    if (!isNaN(newTime)) {
      setCurrentTime(newTime);
      if (isPlaying) togglePlay(); // Pause to let user observe the selected time
      onClose();
    }
  };

  let localTimeDisplay = null;
  if (targetLocation && datetime) {
    const inputTimeMs = new Date(datetime + ':00Z').getTime();
    if (!isNaN(inputTimeMs)) {
      const tzOffsetHours = Math.round(targetLocation.lon / 15);
      const localTimeMs = inputTimeMs + (tzOffsetHours * 3600 * 1000);
      const localDate = new Date(localTimeMs);
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatUTC = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
      const offsetStr = tzOffsetHours >= 0 ? `+${tzOffsetHours}` : `${tzOffsetHours}`;
      
      localTimeDisplay = (
        <div className="mt-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
          <div className="text-xs text-zinc-400 mb-1">Ekuivalen Waktu Lokal:</div>
          <div className="text-sm text-blue-400 font-mono">
            {formatUTC(localDate)} ({targetLocation.name}, UTC{offsetStr})
          </div>
        </div>
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            Lompat ke Waktu (UTC)
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Tanggal & Waktu (UTC)</label>
            <input 
              type="datetime-local" 
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
            {localTimeDisplay}
          </div>
          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-md py-2 text-sm font-medium transition-colors"
          >
            Terapkan
          </button>
        </form>
      </div>
    </div>
  );
}
