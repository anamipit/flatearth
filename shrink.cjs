const fs = require('fs');

function shrinkClasses(code) {
  return code
    // Gaps and Paddings
    .replace(/p-5/g, 'p-3')
    .replace(/p-4/g, 'p-2.5')
    .replace(/p-3/g, 'p-2')
    .replace(/space-y-4/g, 'space-y-2')
    .replace(/space-y-3/g, 'space-y-1.5')
    .replace(/space-y-2/g, 'space-y-1')
    .replace(/gap-3/g, 'gap-1.5')
    .replace(/gap-2/g, 'gap-1')
    // Fonts
    .replace(/text-lg/g, 'text-sm')
    .replace(/text-sm/g, 'text-xs')
    .replace(/text-xs/g, 'text-[10px]')
    .replace(/text-\[10px\]/g, 'text-[9px]')
    .replace(/text-\[11px\]/g, 'text-[9px]')
    // Element sizes
    .replace(/w-80/g, 'w-64')
    .replace(/w-72/g, 'w-56')
    // Icons
    .replace(/size=\{16\}/g, 'size={12}')
    .replace(/size=\{14\}/g, 'size={10}')
    .replace(/size=\{12\}/g, 'size={10}')
    .replace(/size=\{18\}/g, 'size={14}');
}

const files = [
  'src/components/Dashboard.tsx',
  'src/components/LocationSearch.tsx',
  'src/components/MoonPanel.tsx',
  'src/components/PlaybackControls.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = shrinkClasses(code);
  fs.writeFileSync(file, code);
  console.log('Shrunk ' + file);
});
