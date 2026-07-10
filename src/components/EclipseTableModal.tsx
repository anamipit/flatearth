import React, { useState, useMemo } from 'react';
import { X, PlayCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { findEclipsesInRange, findLocalEclipsesInRange } from '../lib/astronomy';
import { useSimulation } from '../store/useSimulation';

interface EclipseTableModalProps {
  type: 'solar' | 'lunar';
  scope: 'global' | 'local';
  onClose: () => void;
}

export function EclipseTableModal({ type, scope, onClose }: EclipseTableModalProps) {
  const { setCurrentTime, isPlaying, togglePlay, targetLocation } = useSimulation();
  
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState<number>(currentYear - 5);
  const [endYear, setEndYear] = useState<number>(currentYear + 10);
  const [isSearching, setIsSearching] = useState(false);

  // We use state to trigger search explicitly to avoid lag when typing
  const [searchTrigger, setSearchTrigger] = useState(0);

  const eclipses = useMemo(() => {
    const startDate = new Date(`${startYear}-01-01T00:00:00Z`);
    const endDate = new Date(`${endYear}-12-31T23:59:59Z`);
    
    if (scope === 'local' && targetLocation) {
      return findLocalEclipsesInRange(startDate, endDate, type, targetLocation.lat, targetLocation.lon);
    } else {
      return findEclipsesInRange(startDate, endDate, type);
    }
  }, [type, scope, targetLocation, searchTrigger]);


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
            {type === 'solar' ? 'Data Gerhana Matahari' : 'Data Gerhana Bulan'} {scope === 'local' && targetLocation ? `(${targetLocation.name})` : '(Global)'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/30 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-zinc-400 mb-1">Dari Tahun</label>
            <input 
              type="number" 
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value) || 1960)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-400 mb-1">Sampai Tahun</label>
            <input 
              type="number" 
              value={endYear}
              onChange={(e) => setEndYear(parseInt(e.target.value) || 2050)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button 
            onClick={() => {
              setIsSearching(true);
              setTimeout(() => {
                setSearchTrigger(prev => prev + 1);
                setIsSearching(false);
              }, 10); // Small delay to let UI render loading state if needed
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-md px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2 h-[34px]"
          >
            {isSearching ? 'Mencari...' : 'Cari'}
          </button>
        </div>

        <div className="p-0 overflow-y-auto custom-scrollbar flex-1 relative min-h-[200px]">
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
