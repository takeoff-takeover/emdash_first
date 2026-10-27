import fs from 'fs';

const raw = fs.readFileSync('src/pages/bmw.astro', 'utf8');
const startQuote = raw.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
const endQuote = raw.lastIndexOf('";\n---');
const html = raw.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

const regex = /<div data-elementor-type="loop-item" data-elementor-id="(\d+)" class="[^"]*post-(\d+) ([^ "]+)/g;
let match;
const groups = {};

while ((match = regex.exec(html)) !== null) {
  const templateId = match[1];
  const postId = match[2];
  const postType = match[3];
  if (!groups[templateId]) {
    groups[templateId] = { postType, count: 0, firstPostId: postId, posts: [] };
  }
  groups[templateId].count++;
  groups[templateId].posts.push(postId);
}

console.log('Loop groups found in BMW page:', groups);
