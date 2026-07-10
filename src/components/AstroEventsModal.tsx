import React, { useMemo } from 'react';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useSimulation } from '../store/useSimulation';
import { getSeasons, getNextMoonQuarters, getNextLunarApsides, getPlanetEvents } from '../lib/astronomy';

export function AstroEventsModal({ onClose }: { onClose: () => void }) {
  const { currentTime, setCurrentTime, togglePlay, isPlaying } = useSimulation();
  
  const events = useMemo(() => {
    const date = new Date(currentTime);
    const seasons = getSeasons(date.getFullYear());
    const moonQuarters = getNextMoonQuarters(date, 8);
    const apsides = getNextLunarApsides(date, 4);
    const planetEvents = getPlanetEvents(date);
    return { seasons, moonQuarters, apsides, planetEvents };
  }, [currentTime]);

  const handleJumpToEvent = (dateStr: Date | string) => {
    setCurrentTime(new Date(dateStr).getTime());
    if (isPlaying) togglePlay(); // Pause to let user observe the event
    onClose();
  };

  const getQuarterName = (q: number) => {
    switch (q) {
      case 0: return 'Bulan Baru (New Moon)';
      case 1: return 'Kuartal Pertama (First Quarter)';
      case 2: return 'Purnama (Full Moon)';
      case 3: return 'Kuartal Ketiga (Third Quarter)';
      default: return '';
    }
  };

  const getApsisName = (kind: number) => {
    return kind === 0 ? 'Perigee (Terdekat)' : 'Apogee (Terjauh)';
  };

  const formatUTC = (d: Date | string) => {
    if (!d) return "-";
    const date = new Date(d);
    return format(date, "yyyy-MM-dd HH:mm") + " UTC";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Calendar size={18} className="text-emerald-400" />
            Kalender Peristiwa Astronomi
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-1 overflow-y-auto custom-scrollbar flex-1">
          <div className="p-4 space-y-8">
            
            {/* Seasons */}
            {events.seasons && (
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3 border-b border-zinc-800 pb-1">Musim (Ekuinoks & Solstis) Tahun {new Date(currentTime).getFullYear()}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Ekuinoks Maret (Vernal)', date: events.seasons.marEquinox, color: 'text-emerald-400' },
                    { name: 'Solstis Juni (Panas)', date: events.seasons.junSolstice, color: 'text-yellow-400' },
                    { name: 'Ekuinoks September (Autumnal)', date: events.seasons.sepEquinox, color: 'text-orange-400' },
                    { name: 'Solstis Desember (Dingin)', date: events.seasons.decSolstice, color: 'text-blue-400' }
                  ].map((evt, i) => (
                    <div key={i} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center group cursor-pointer hover:bg-zinc-800 transition-colors" onClick={() => handleJumpToEvent(evt.date)}>
                      <div>
                        <div className={`text-xs font-medium mb-1 ${evt.color}`}>{evt.name}</div>
                        <div className="text-sm font-mono text-zinc-300">{formatUTC(evt.date)}</div>
                      </div>
                      <div className="text-zinc-600 group-hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Loncat &rarr;
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moon Quarters */}
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3 border-b border-zinc-800 pb-1">Fase Bulan Berikutnya</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.moonQuarters.map((mq, i) => (
                  <div key={i} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center group cursor-pointer hover:bg-zinc-800 transition-colors" onClick={() => handleJumpToEvent(mq.date)}>
                    <div>
                      <div className="text-xs text-zinc-400 mb-1">{getQuarterName(mq.quarter)}</div>
                      <div className="text-sm font-mono text-zinc-300">{formatUTC(mq.date)}</div>
                    </div>
                    <div className="text-zinc-600 group-hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Loncat &rarr;
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lunar Apsides */}
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3 border-b border-zinc-800 pb-1">Jarak Bulan Berikutnya</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.apsides.map((apsis, i) => (
                  <div key={i} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center group cursor-pointer hover:bg-zinc-800 transition-colors" onClick={() => handleJumpToEvent(apsis.date)}>
                    <div>
                      <div className={`text-xs mb-1 ${apsis.kind === 0 ? 'text-indigo-400' : 'text-purple-400'}`}>
                        {getApsisName(apsis.kind)}
                      </div>
                      <div className="text-sm font-mono text-zinc-300 mb-1">{formatUTC(apsis.date)}</div>
                      <div className="text-[10px] text-zinc-500">Jarak: {Math.round(apsis.dist_km).toLocaleString()} km</div>
                    </div>
                    <div className="text-zinc-600 group-hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Loncat &rarr;
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Planet Events */}
            {events.planetEvents && events.planetEvents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3 border-b border-zinc-800 pb-1">Peristiwa Planet Terdekat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {events.planetEvents.slice(0, 10).map((pe, i) => (
                    <div key={i} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center group cursor-pointer hover:bg-zinc-800 transition-colors" onClick={() => handleJumpToEvent(pe.date)}>
                      <div>
                        <div className="text-xs mb-1 font-medium text-blue-400">
                          {pe.body} - {pe.type}
                        </div>
                        <div className="text-sm font-mono text-zinc-300 mb-1">{formatUTC(pe.date)}</div>
                        <div className="text-[10px] text-zinc-500">{pe.details}</div>
                      </div>
                      <div className="text-zinc-600 group-hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Loncat &rarr;
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
