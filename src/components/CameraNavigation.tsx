import React, { useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpToLine, ArrowDownToLine, RotateCcw, RotateCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSimulation } from '../store/useSimulation';

export function CameraNavigation() {
  const { cameraMovement, setCameraMovement, cameraRotation, setCameraRotation } = useSimulation();

  // Create a stable ref to avoid dependency cycles in event listeners
  const moveRef = useRef(cameraMovement);
  useEffect(() => { moveRef.current = cameraMovement; }, [cameraMovement]);

  const updateMove = (axis: 'x' | 'y' | 'z', value: number) => {
    setCameraMovement({ ...moveRef.current, [axis]: value });
  };

  const rotRef = useRef(cameraRotation);
  useEffect(() => { rotRef.current = cameraRotation; }, [cameraRotation]);

  const updateRot = (axis: 'x' | 'y', value: number) => {
    setCameraRotation({ ...rotRef.current, [axis]: value });
  };

  const handlePointerDownMove = (axis: 'x' | 'y' | 'z', value: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    updateMove(axis, value);
  };

  const handlePointerUpMove = (axis: 'x' | 'y' | 'z') => (e: React.PointerEvent) => {
    e.preventDefault();
    updateMove(axis, 0);
  };

  const handlePointerDownRot = (axis: 'x' | 'y', value: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    updateRot(axis, value);
  };

  const handlePointerUpRot = (axis: 'x' | 'y') => (e: React.PointerEvent) => {
    e.preventDefault();
    updateRot(axis, 0);
  };

  return (
    <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 font-sans select-none pointer-events-auto">
      {/* Rotation Panel */}
      <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl p-2 shadow-2xl flex flex-col gap-2">
        <div className="text-[10px] text-zinc-500 text-center font-medium uppercase tracking-wider mb-1">Rotasi Pandangan</div>
        <div className="grid grid-cols-3 gap-1">
          <div className="col-start-2">
            <button
              onPointerDown={handlePointerDownRot('y', 1)}
              onPointerUp={handlePointerUpRot('y')}
              onPointerLeave={handlePointerUpRot('y')}
              className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
              title="Lihat Atas (Rotasi Y)"
            >
              <ChevronUp size={18} />
            </button>
          </div>
          <div className="col-start-1 row-start-2">
            <button
              onPointerDown={handlePointerDownRot('x', 1)}
              onPointerUp={handlePointerUpRot('x')}
              onPointerLeave={handlePointerUpRot('x')}
              className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
              title="Tengok Kiri (Rotasi X)"
            >
              <RotateCcw size={18} />
            </button>
          </div>
          <div className="col-start-2 row-start-2">
            <button
              onPointerDown={handlePointerDownRot('y', -1)}
              onPointerUp={handlePointerUpRot('y')}
              onPointerLeave={handlePointerUpRot('y')}
              className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
              title="Lihat Bawah (Rotasi Y)"
            >
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="col-start-3 row-start-2">
            <button
              onPointerDown={handlePointerDownRot('x', -1)}
              onPointerUp={handlePointerUpRot('x')}
              onPointerLeave={handlePointerUpRot('x')}
              className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
              title="Tengok Kanan (Rotasi X)"
            >
              <RotateCw size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl p-2 shadow-2xl flex flex-col gap-2">
        <div className="text-[10px] text-zinc-500 text-center font-medium uppercase tracking-wider mb-1">Posisi Kamera</div>
        
        {/* Y Axis (Up / Down) */}
        <div className="flex justify-center gap-1">
          <button
            onPointerDown={handlePointerDownMove('y', 1)}
            onPointerUp={handlePointerUpMove('y')}
            onPointerLeave={handlePointerUpMove('y')}
            className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
            title="Naik (Sumbu Y)"
          >
            <ArrowUpToLine size={18} />
          </button>
          <button
            onPointerDown={handlePointerDownMove('y', -1)}
            onPointerUp={handlePointerUpMove('y')}
            onPointerLeave={handlePointerUpMove('y')}
            className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
            title="Turun (Sumbu Y)"
          >
            <ArrowDownToLine size={18} />
          </button>
        </div>

        {/* X and Z Axes (WASD equivalent) */}
        <div className="grid grid-cols-3 gap-1">
          <div className="col-start-2">
            <button
              onPointerDown={handlePointerDownMove('z', -1)}
              onPointerUp={handlePointerUpMove('z')}
              onPointerLeave={handlePointerUpMove('z')}
              className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
              title="Maju (Sumbu Z)"
            >
              <ArrowUp size={18} />
            </button>
          </div>
          <div className="col-start-1 row-start-2">
            <button
              onPointerDown={handlePointerDownMove('x', -1)}
              onPointerUp={handlePointerUpMove('x')}
              onPointerLeave={handlePointerUpMove('x')}
              className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
              title="Kiri (Sumbu X)"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
          <div className="col-start-2 row-start-2">
            <button
              onPointerDown={handlePointerDownMove('z', 1)}
              onPointerUp={handlePointerUpMove('z')}
              onPointerLeave={handlePointerUpMove('z')}
              className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
              title="Mundur (Sumbu Z)"
            >
              <ArrowDown size={18} />
            </button>
          </div>
          <div className="col-start-3 row-start-2">
            <button
              onPointerDown={handlePointerDownMove('x', 1)}
              onPointerUp={handlePointerUpMove('x')}
              onPointerLeave={handlePointerUpMove('x')}
              className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-800 transition-colors"
              title="Kanan (Sumbu X)"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
