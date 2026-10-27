import fs from 'fs';

// Find magic-link send implementation
const files = fs.readdirSync('node_modules/emdash/dist/astro/routes').filter(f => f.includes('magic-link') || f.includes('auth'));
console.log('Routes in dist/astro/routes:', files);

// Let's search for magic-link/send
const search = (dir) => {
  let res = [];
  try {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = dir + '/' + item.name;
      if (item.isDirectory()) res = res.concat(search(p));
      else if (item.name.includes('magic-link') || item.name.includes('passkey')) res.push(p);
    }
  } catch(e) {}
  return res;
};

console.log('Matching files:', search('node_modules/emdash/dist'));
