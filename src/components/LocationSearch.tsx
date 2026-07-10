import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';

export function LocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const { setTargetLocation, targetLocation } = useSimulation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&featuretype=city`);
        const data = await res.json();
        setResults(data);
      } catch (e) {
        console.error('Failed to search location', e);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (item: any) => {
    setTargetLocation({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      name: item.display_name.split(',')[0],
    });
    setQuery('');
    setIsOpen(false);
  };

  const clearLocation = () => {
    setTargetLocation(null);
  };

  return (
    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 w-64 font-sans" ref={wrapperRef}>
      <div className="relative flex items-center bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-full shadow-2xl px-3 py-2 transition-all">
        <Search size={10} className="text-zinc-400 min-w-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={targetLocation ? `📍 ${targetLocation.name}` : "Cari kota (mis: Bandung)..."}
          className="bg-transparent border-none outline-none text-[9px] text-zinc-100 w-full px-2 placeholder:text-zinc-500"
        />
        {isSearching && <Loader2 size={10} className="text-zinc-400 animate-spin" />}
        {targetLocation && !query && (
          <button onClick={clearLocation} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X size={10} />
          </button>
        )}
      </div>

      {isOpen && (query.trim().length >= 3 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          {results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto custom-scrollbar py-1">
              {results.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/80 transition-colors flex items-start gap-1 border-b border-zinc-800/50 last:border-0"
                  >
                    <MapPin size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[9px] font-medium text-zinc-200 line-clamp-1">{item.display_name.split(',')[0]}</div>
                      <div className="text-[9px] text-zinc-500 line-clamp-1">{item.display_name}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 3 && !isSearching ? (
            <div className="p-2.5 text-center text-[9px] text-zinc-500">
              Tidak ada hasil ditemukan.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
