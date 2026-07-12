const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  /            \{\/\* Scale Controls \*\/\}/,
  `            {/* View Mode */}
            <div className="space-y-1">
              <div className="text-[9px] text-zinc-400">Model Visualisasi</div>
              <div className="grid grid-cols-2 gap-1">
                <button 
                  onClick={() => setFlatTerminator(!flatTerminator)}
                  className={\`w-full flex items-center justify-center gap-1.5 \${flatTerminator ? 'bg-orange-900/40 text-orange-400 border-orange-500/50' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'} text-[9px] py-1.5 rounded-md transition-colors border\`}
                >
                  <SunDim size={10} />
                  Sorotan Flat
                </button>
              </div>
            </div>
            
            {/* Scale Controls */}`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
