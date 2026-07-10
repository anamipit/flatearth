import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, RotateCcw, Eclipse, Moon, ChevronUp, ChevronDown, Sparkles, Sunrise, Sunset, Calendar } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';
import { getSunPosition, getMoonPosition, getGMST, getSubpoint, getAngularDistance, getRiseSetTimes, getPlanetStats } from '../lib/astronomy';
import { format } from 'date-fns';
import { EclipseTableModal } from './EclipseTableModal';

export function Dashboard() {
  const { 
    currentTime, 
    speedMultiplier, 
    isPlaying, 
    setSpeedMultiplier, 
    togglePlay, 
    resetToNow, 
    setCurrentTime, 
    sunScale, 
    sunHeight, 
    setSunScale, 
    setSunHeight,
    showConstellations,
    setShowConstellations,
    targetLocation,
    setShowAstroEvents
  } = useSimulation();

  const [eclipseModal, setEclipseModal] = useState<{type: 'solar' | 'lunar', scope: 'global' | 'local'} | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const riseSetTimes = React.useMemo(() => {
    if (targetLocation) {
      const d = new Date(currentTime);
      const startOfDay = new Date(d);
      startOfDay.setUTCHours(0,0,0,0);
      return getRiseSetTimes(startOfDay, targetLocation.lat, targetLocation.lon);
    }
    return null;
  }, [targetLocation, new Date(currentTime).getUTCDate(), new Date(currentTime).getUTCMonth(), new Date(currentTime).getUTCFullYear()]);
  
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

  const formatRA = (raDeg: number) => {
    const hours = raDeg / 15;
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    const s = Math.floor((((hours % 1) * 60) % 1) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  const formatTime = (d: Date | null) => {
    if (!d) return "-";
    // Get time in UTC
    const h = d.getUTCHours().toString().padStart(2, '0');
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-10 w-80 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl p-5 text-zinc-100 shadow-2xl font-sans transition-all duration-300">
        <div className={`flex items-center justify-between ${isMinimized ? '' : 'mb-4'}`}>
          <h1 className="text-lg font-medium tracking-tight text-white">Flat Earth Tracker</h1>
          <div className="flex gap-2">
            {!isMinimized && (
              <button onClick={resetToNow} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors" title="Kembali ke Sekarang">
                <RotateCcw size={14} />
              </button>
            )}
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors" title={isMinimized ? "Perbesar" : "Perkecil"}>
              {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="space-y-4">
            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
                  Titik Subsolar
                </div>
                <div className="font-mono text-xs space-y-1">
                  <div>Lat: {formatCoord(sunSub.lat, true)}</div>
                  <div>Lon: {formatCoord(sunSub.lon, false)}</div>
                </div>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></span>
                  Matahari (Eklipika)
                </div>
                <div className="font-mono text-xs space-y-1">
                  <div>Bujur: {planetStats.sun.elon.toFixed(2)}°</div>
                  <div>Lintang: {planetStats.sun.elat.toFixed(4)}°</div>
                </div>
              </div>
            </div>
            
            {/* Eclipse Finders & Astro Events */}
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Pencarian & Peristiwa</div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setShowAstroEvents(true)} 
                  className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs py-2 rounded-md transition-colors border border-emerald-700/50 text-emerald-400"
                >
                  <Calendar size={12} />
                  Kalender
                </button>
                <button 
                  onClick={() => setEclipseModal({type: 'solar', scope: 'global'})} 
                  className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs py-2 rounded-md transition-colors border border-zinc-700"
                >
                  <Eclipse size={12} className="text-yellow-400" />
                  Gerhana
                </button>
              </div>
              {targetLocation && (
                <div className="pt-1">
                  <button 
                    onClick={() => setEclipseModal({type: 'solar', scope: 'local'})} 
                    className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] py-1.5 rounded-md transition-colors border border-emerald-700/50 text-emerald-400"
                  >
                    <Eclipse size={10} /> 
                    <span className="truncate max-w-[150px]">Gerhana di {targetLocation.name}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Scale Controls */}
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Ukuran Matahari</span>
                  <span className="font-mono">{sunScale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" max="5" step="0.1" 
                  value={sunScale} 
                  onChange={(e) => setSunScale(parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Ketinggian Matahari</span>
                  <span className="font-mono">{sunHeight.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="10" step="0.1" 
                  value={sunHeight} 
                  onChange={(e) => setSunHeight(parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Constellation Toggle */}
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className={showConstellations ? "text-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-zinc-500"} />
                <span className="text-xs text-zinc-300 font-medium">Bintang & Rasi (Polaris)</span>
              </div>
              <button
                onClick={() => setShowConstellations(!showConstellations)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  showConstellations ? 'bg-yellow-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-zinc-950 transition-transform ${
                    showConstellations ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Target Location Rise/Set Info */}
            {targetLocation && riseSetTimes && (
              <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 space-y-2">
                <div className="text-xs text-emerald-400 font-medium border-b border-zinc-800/50 pb-1 mb-2">
                  📍 {targetLocation.name} (UTC)
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-950/50 p-2 rounded flex flex-col items-center justify-center border border-zinc-800/30">
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1"><Sunrise size={10} className="text-yellow-500"/> Matahari Terbit</div>
                    <div className="text-xs font-mono text-zinc-300 mt-1">
                      {formatTime(riseSetTimes.sunRise)}
                    </div>
                  </div>
                  <div className="bg-zinc-950/50 p-2 rounded flex flex-col items-center justify-center border border-zinc-800/30">
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1"><Sunset size={10} className="text-orange-500"/> Matahari Terbenam</div>
                    <div className="text-xs font-mono text-zinc-300 mt-1">
                      {formatTime(riseSetTimes.sunSet)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-950/50 p-2 rounded flex flex-col items-center justify-center border border-zinc-800/30">
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1"><Sunrise size={10} className="text-blue-300"/> Bulan Terbit</div>
                    <div className="text-xs font-mono text-zinc-300 mt-1">
                      {formatTime(riseSetTimes.moonRise)}
                    </div>
                  </div>
                  <div className="bg-zinc-950/50 p-2 rounded flex flex-col items-center justify-center border border-zinc-800/30">
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1"><Sunset size={10} className="text-indigo-400"/> Bulan Terbenam</div>
                    <div className="text-xs font-mono text-zinc-300 mt-1">
                      {formatTime(riseSetTimes.moonSet)}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
          type={eclipseModal.type} 
          scope={eclipseModal.scope}
          onClose={() => setEclipseModal(null)} 
        />
      )}
    </>
  );
}
