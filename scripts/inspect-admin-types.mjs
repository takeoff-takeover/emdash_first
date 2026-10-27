import fs from 'fs';

const dts = fs.readFileSync('node_modules/@emdash-cms/admin/dist/index.d.ts', 'utf8');
console.log('Admin d.ts preview (first 1000):');
console.log(dts.slice(0, 1000));
