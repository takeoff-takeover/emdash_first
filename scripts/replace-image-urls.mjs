import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const baseTargetDir = path.resolve('public/uploads');

// 1. First, analyze all files in public/uploads to know what exists
const localFiles = new Set();
function scanLocalFiles(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) scanLocalFiles(full);
    else {
      const rel = path.relative(baseTargetDir, full).replace(/\\/g, '/');
      localFiles.add(rel);
    }
  }
}
scanLocalFiles(baseTargetDir);
console.log(`Indexed ${localFiles.size} downloaded files in public/uploads.`);

// Helper to resolve URL to local /uploads/ path
function replaceUrlInString(text) {
  if (!text) return text;
  
  // Replace https?://(www\.)?nicole\.co\.jp/wp/wp-content/uploads/ with /uploads/
  return text.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/wp\/wp-content\/uploads\/([^\s"'()><\\]+)/gi, (match, relPath) => {
    // If there are trailing punctuation from markdown or prose, isolate them
    let trailing = '';
    const punctuationMatch = relPath.match(/([,);]+)$/);
    if (punctuationMatch) {
      trailing = punctuationMatch[1];
      relPath = relPath.slice(0, -trailing.length);
    }

    // Check query params
    let query = '';
    const qIdx = relPath.indexOf('?');
    if (qIdx !== -1) {
      query = relPath.slice(qIdx);
      relPath = relPath.slice(0, qIdx);
    }

    // Check if the decoded file exists
    let decoded = relPath;
    try {
      decoded = decodeURIComponent(relPath);
    } catch (e) {}

    // If local file exists with decoded name, keep decoded or encoded
    // Standard web paths: /uploads/...
    // Let's use decoded path (or keep as is if exists)
    return `/uploads/${relPath}${query}${trailing}`;
  });
}

// 2. Process all files in src/
let srcCount = 0;
function processDir(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules', '.git', '.wrangler', 'dist', 'public'].includes(f.name)) {
      processDir(full);
    } else if (f.isFile() && (f.name.endsWith('.astro') || f.name.endsWith('.ts') || f.name.endsWith('.json') || f.name.endsWith('.css') || f.name.endsWith('.html') || f.name.endsWith('.md'))) {
      const content = fs.readFileSync(full, 'utf8');
      const updated = replaceUrlInString(content);
      if (content !== updated) {
        fs.writeFileSync(full, updated, 'utf8');
        srcCount++;
        console.log(`Updated: ${path.relative('.', full)}`);
      }
    }
  }
}

processDir('src');
console.log(`Updated ${srcCount} files in src/`);

// 3. Process seed/seed.json
if (fs.existsSync('seed/seed.json')) {
  const seedRaw = fs.readFileSync('seed/seed.json', 'utf8');
  const seedUpdated = replaceUrlInString(seedRaw);
  if (seedRaw !== seedUpdated) {
    fs.writeFileSync('seed/seed.json', seedUpdated, 'utf8');
    console.log('Updated: seed/seed.json');
  }
}

// 4. Process SQLite D1 database
const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
if (fs.existsSync(d1Dir)) {
  const files = fs.readdirSync(d1Dir);
  const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
  if (dbFile) {
    const dbPath = path.join(d1Dir, dbFile);
    const db = new DatabaseSync(dbPath);
    console.log(`Updating SQLite database at ${dbPath}...`);

    // Update ec_posts
    const posts = db.prepare('SELECT id, featured_image, content FROM ec_posts').all();
    let updatedPosts = 0;
    const updatePostStmt = db.prepare('UPDATE ec_posts SET featured_image = ?, content = ? WHERE id = ?');
    for (const post of posts) {
      const newImg = replaceUrlInString(post.featured_image);
      const newContent = replaceUrlInString(post.content);
      if (newImg !== post.featured_image || newContent !== post.content) {
        updatePostStmt.run(newImg, newContent, post.id);
        updatedPosts++;
      }
    }
    console.log(`Updated ${updatedPosts} records in ec_posts.`);

    // Update ec_pages
    const pages = db.prepare('SELECT id, content FROM ec_pages').all();
    let updatedPages = 0;
    const updatePageStmt = db.prepare('UPDATE ec_pages SET content = ? WHERE id = ?');
    for (const page of pages) {
      const newContent = replaceUrlInString(page.content);
      if (newContent !== page.content) {
        updatePageStmt.run(newContent, page.id);
        updatedPages++;
      }
    }
    console.log(`Updated ${updatedPages} records in ec_pages.`);

    // Also update full-text search index if present
    try {
      db.exec(`INSERT INTO _emdash_fts_posts(_emdash_fts_posts) VALUES('rebuild');`);
      db.exec(`INSERT INTO _emdash_fts_pages(_emdash_fts_pages) VALUES('rebuild');`);
      console.log('Rebuilt full-text search indices.');
    } catch (e) {
      console.log('FTS rebuild notice:', e.message);
    }
  }
}

console.log('Image URL replacement completed successfully!');
