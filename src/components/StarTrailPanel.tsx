import React from 'react';
import { Compass, X } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';

export function StarTrailPanel() {
  const { showStarTrail, setShowStarTrail, targetLocation } = useSimulation();

  if (!showStarTrail) return null;

  return (
    <div className="absolute top-4 right-1/2 translate-x-[40%] z-20 w-64 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-2xl font-sans">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[11px] font-medium text-zinc-100 flex items-center gap-1.5">
          <Compass size={12} className="text-yellow-400" />
          Rotasi Bintang
        </h2>
        <button onClick={() => setShowStarTrail(false)} className="text-zinc-500 hover:text-white transition-colors">
          <X size={12} />
        </button>
      </div>

      <div className="text-[9px] text-zinc-400 mb-2 leading-relaxed">
        Di bumi bulat, pengamat di selatan melihat bintang mengelilingi Sigma Octantis, 
        sedangkan di utara mengelilingi Polaris.
      </div>
      
      <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
        <div className="text-[9px] font-medium text-zinc-300 border-b border-zinc-800/50 pb-1 mb-1">
          Pada Flat Earth
        </div>
        <div className="text-[9px] text-zinc-400 leading-relaxed">
          Semua bintang berada di dalam satu kubah (Dome) yang berputar berpusat di Kutub Utara (Polaris).
        </div>
      </div>
      
      <div className="mt-2 text-[9px] text-zinc-500 bg-zinc-900/30 p-2 rounded border border-zinc-800/30">
        💡 <strong>Coba ini:</strong> {targetLocation ? `Posisi saat ini di ${targetLocation.name}. Coba putar kamera ke atas melihat ke langit.` : 'Cari lokasi (contoh: Sydney, Australia), lalu putar kamera ke atas.'}
      </div>
    </div>
  );
}