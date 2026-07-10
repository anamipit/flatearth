import React, { useMemo } from 'react';
import { X, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { findEclipsesInRange } from '../lib/astronomy';
import { useSimulation } from '../store/useSimulation';

interface EclipseTableModalProps {
  type: 'solar' | 'lunar';
  onClose: () => void;
}

export function EclipseTableModal({ type, onClose }: EclipseTableModalProps) {
  const { setCurrentTime, isPlaying, togglePlay } = useSimulation();

  const eclipses = useMemo(() => {
    // Look from 5 years ago to 10 years in the future
    const now = Date.now();
    const startDate = new Date(now - 5 * 365 * 86400000);
    const endDate = new Date(now + 10 * 365 * 86400000);
    return findEclipsesInRange(startDate, endDate, type);
  }, [type]);

  const handleJumpToEclipse = (date: Date) => {
    setCurrentTime(date.getTime());
    if (isPlaying) togglePlay(); // Pause so user can observe
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            {type === 'solar' ? 'Data Gerhana Matahari' : 'Data Gerhana Bulan'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900 text-zinc-400 sticky top-0">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal (UTC)</th>
                <th className="px-4 py-3 font-medium">Waktu (UTC)</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {eclipses.map((eclipse, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="px-4 py-3 font-mono">{format(eclipse, 'yyyy-MM-dd')}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{format(eclipse, 'HH:mm:ss')}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleJumpToEclipse(eclipse)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 rounded-md transition-colors text-xs font-medium"
                    >
                      <PlayCircle size={14} />
                      Lihat
                    </button>
                  </td>
                </tr>
              ))}
              {eclipses.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                    Tidak ada data gerhana ditemukan di rentang waktu ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
