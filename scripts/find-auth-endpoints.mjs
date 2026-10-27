import fs from 'fs';

const adminCode = fs.readFileSync('node_modules/@emdash-cms/admin/dist/index.js', 'utf8');

// Look for login / magic-link / passkey / setup in admin
const loginIdx = adminCode.indexOf('login');
console.log('Search login in admin:');

// Find how login requests are sent
const matches = adminCode.match(/\/(api\/auth\/[a-zA-Z0-9_\-\/]+)/g) || [];
console.log('API auth endpoints referenced in admin:', Array.from(new Set(matches)));
