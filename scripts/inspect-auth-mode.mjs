import fs from 'fs';

const modeCode = fs.readFileSync('node_modules/emdash/dist/mode-DIDSUwuN.mjs', 'utf8');
console.log('modeCode:');
console.log(modeCode.slice(0, 500));
