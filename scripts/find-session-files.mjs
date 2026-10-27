import fs from 'fs';

// Find session-user implementation
const glob = (dir) => {
  let res = [];
  try {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = dir + '/' + item.name;
      if (item.isDirectory()) res = res.concat(glob(p));
      else if (item.name.includes('session-user') || item.name.includes('session')) res.push(p);
    }
  } catch(e) {}
  return res;
};

console.log('Session files:', glob('node_modules/emdash'));
