import fetch from 'node-fetch';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

async function checkLogin() {
  const res = await fetch('http://localhost:4321/_emdash/admin/login');
  console.log('Login page status:', res.status);
  const text = await res.text();
  console.log('Login page text length:', text.length);
  console.log('Login preview:');
  console.log(text.slice(0, 1000));

  // Check database users table
  const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
  if (fs.existsSync(d1Dir)) {
    const files = fs.readdirSync(d1Dir);
    const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
    if (dbFile) {
      const db = new DatabaseSync(path.join(d1Dir, dbFile));
      // List tables
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log('Database tables:', tables.map(t => t.name));
      
      const userTables = tables.filter(t => t.name.includes('user') || t.name.includes('auth') || t.name.includes('member'));
      console.log('User-related tables:', userTables);
      for (const ut of userTables) {
        try {
          const rows = db.prepare(`SELECT * FROM ${ut.name} LIMIT 5`).all();
          console.log(`Table ${ut.name} rows:`, rows);
        } catch (e) {
          console.log(`Error reading ${ut.name}:`, e.message);
        }
      }
    }
  }
}

checkLogin();
