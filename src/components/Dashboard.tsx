import React, { useState } from 'react';
import { Play, Pause, FastForward, RotateCcw, Eclipse, Moon, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';
import { getSunPosition, getMoonPosition, getGMST, getSubpoint, getAngularDistance, findNextEclipse } from '../lib/astronomy';
import { format } from 'date-fns';
import { EclipseTableModal } from './EclipseTableModal';
import { DatePickerModal } from './DatePickerModal';

export function Dashboard() {
  const { currentTime, speedMultiplier, isPlaying, setSpeedMultiplier, togglePlay, resetToNow, setCurrentTime } = useSimulation();
  const [eclipseModal, setEclipseModal] = useState<'solar' | 'lunar' | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const date = new Date(currentTime);
  const gmst = getGMST(date);
  
  const sunPos = getSunPosition(date);
  const sunSub = getSubpoint(sunPos.ra, sunPos.dec, gmst);
  
  const moonPos = getMoonPosition(date);
  const moonSub = getSubpoint(moonPos.ra, moonPos.dec, gmst);
  
  // Check for conjunctions/eclipses
  const distance = getAngularDistance(sunSub.lat, sunSub.lon, moonSub.lat, moonSub.lon);
  let eventText = null;
  
  const oppSunLat = -sunSub.lat;
  let oppSunLon = sunSub.lon + 180;
  if (oppSunLon > 180) oppSunLon -= 360;
  const lunarDist = getAngularDistance(oppSunLat, oppSunLon, moonSub.lat, moonSub.lon);
  
  if (distance < 1.5) {
    eventText = "Gerhana Matahari Terjadi!";
  } else if (lunarDist < 1.5) {
    eventText = "Gerhana Bulan Terjadi!";
  } else if (distance < 5.0) {
    eventText = "Bulan Baru / Konjungsi Terdekat";
  } else if (lunarDist < 5.0) {
    eventText = "Bulan Purnama Terdekat";
  }
  
  const formatCoord = (val: number, isLat: boolean) => {
    const dir = isLat ? (val >= 0 ? 'U' : 'S') : (val >= 0 ? 'T' : 'B');
    return `${Math.abs(val).toFixed(2)}° ${dir}`;
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-10 w-80 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl p-5 text-zinc-100 shadow-2xl font-sans transition-all duration-300">
        <div className={`flex items-center justify-between ${isMinimized ? '' : 'mb-4'}`}>
          <h1 className="text-lg font-medium tracking-tight text-white">Flat Earth Tracker</h1>
          <div className="flex gap-2">
            {!isMinimized && (
              <>
                <button onClick={() => setShowDatePicker(true)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors" title="Pilih Tanggal & Waktu">
                  <Calendar size={14} />
                </button>
                <button onClick={resetToNow} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors" title="Kembali ke Sekarang">
                  <RotateCcw size={14} />
                </button>
              </>
            )}
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors" title={isMinimized ? "Perbesar" : "Perkecil"}>
              {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="space-y-4">
            {/* Time Info */}
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
              <div className="text-xs text-zinc-400 mb-1">Waktu Simulasi (UTC)</div>
              <div className="text-lg font-mono text-emerald-400">
                {format(date, "yyyy-MM-dd HH:mm:ss")}
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
                  Titik Matahari
                </div>
                <div className="font-mono text-xs space-y-1">
                  <div>Lat: {formatCoord(sunSub.lat, true)}</div>
                  <div>Lon: {formatCoord(sunSub.lon, false)}</div>
                </div>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-100 shadow-[0_0_8px_rgba(219,234,254,0.8)]"></span>
                  Titik Bulan
                </div>
                <div className="font-mono text-xs space-y-1">
                  <div>Lat: {formatCoord(moonSub.lat, true)}</div>
                  <div>Lon: {formatCoord(moonSub.lon, false)}</div>
                </div>
              </div>
            </div>
            
            {/* Eclipse Finders */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setEclipseModal('solar')} className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-xs py-2 rounded-md transition-colors border border-zinc-700">
                <Eclipse size={12} className="text-yellow-400" />
                Gerhana Matahari
              </button>
              <button onClick={() => setEclipseModal('lunar')} className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-xs py-2 rounded-md transition-colors border border-zinc-700">
                <Moon size={12} className="text-red-400" />
                Gerhana Bulan
              </button>
            </div>

            {/* Notifications */}
            {eventText && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs py-2 px-3 rounded-lg flex items-center gap-2 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                {eventText}
              </div>
            )}
          </div>
        )}
      </div>

      {eclipseModal && (
        <EclipseTableModal 
          type={eclipseModal} 
          onClose={() => setEclipseModal(null)} 
        />
      )}
      
      {showDatePicker && (
        <DatePickerModal onClose={() => setShowDatePicker(false)} />
      )}
    </>
  );
}
