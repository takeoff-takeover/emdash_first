import fs from 'fs';

const authCode = fs.readFileSync('node_modules/emdash/dist/astro/middleware/auth.mjs', 'utf8');
console.log('auth.mjs preview:');
console.log(authCode.slice(0, 800));
