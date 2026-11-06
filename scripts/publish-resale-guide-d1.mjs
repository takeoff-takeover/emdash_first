import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
const slug='bmw-mini-rolls-royce-ferrari-resale-guide';
const wrangler=args=>{
  const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','my-emdash-site','--remote',...args,'--json'],{encoding:'utf8',maxBuffer:8*1024*1024});
  if(r.status!==0)throw Error(r.stderr||r.stdout);
  // File imports print upload progress before JSON; verify the result with a separate query.
  if(args.includes('--file'))return [];
  const parsed=JSON.parse(r.stdout);if(parsed.some(p=>!p.success))throw Error('D1 query failed');return parsed;
};
const [result]=wrangler(['--command',`SELECT * FROM ec_magazine WHERE slug='${slug}';`]);
if(result.results.length!==1)throw Error('Expected exactly one production article');
const remote=result.results[0];
if(remote.draft_revision_id)throw Error('Production has pending draft');
const remoteRevision=wrangler(['--command',`SELECT * FROM revisions WHERE id='${remote.live_revision_id}';`])[0].results;
fs.writeFileSync('scratch/resale-production-before.json',JSON.stringify({entry:remote,revisions:remoteRevision},null,2));
const db=new DatabaseSync('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/'+fs.readFileSync('seed/db-filename.txt','utf8').trim());
const local=db.prepare('SELECT * FROM ec_magazine WHERE slug=?').get(slug);
const revision=db.prepare('SELECT * FROM revisions WHERE id=?').get(local.live_revision_id);db.close();
if(local.id!==remote.id||local.layout!=='2col'||!revision)throw Error('Unexpected article');
const q=value=>value==null?'NULL':`'${String(value).replaceAll("'","''")}'`;
// Preserve remote history and concurrent changes; promote a new immutable local revision.
const guard=`id=${q(remote.id)} AND slug=${q(slug)} AND version=${Number(remote.version)} AND live_revision_id=${q(remote.live_revision_id)} AND draft_revision_id IS NULL`;
const sql=`INSERT INTO revisions (id,collection,entry_id,data,author_id,created_at) SELECT ${q(revision.id)},'magazine',${q(remote.id)},${q(revision.data)},${q(remote.author_id)},${q(revision.created_at)} WHERE EXISTS (SELECT 1 FROM ec_magazine WHERE ${guard}) AND NOT EXISTS(SELECT 1 FROM revisions WHERE id=${q(revision.id)});\nUPDATE ec_magazine SET title=${q(local.title)},excerpt=${q(local.excerpt)},content=${q(local.content)},featured_image=${q(local.featured_image)},layout='2col',live_revision_id=${q(revision.id)},version=version+1,updated_at=${q(new Date().toISOString())} WHERE ${guard};`;
fs.writeFileSync('scratch/resale-production-update.sql',sql);
console.log(JSON.stringify({id:remote.id,oldVersion:remote.version,oldContentLength:remote.content.length,newContentLength:local.content.length,apply:process.argv.includes('--apply')}));
if(!process.argv.includes('--apply'))process.exit(0);
const applied=wrangler(['--file','scratch/resale-production-update.sql','-y']);
const confirmed=wrangler(['--command',`SELECT id,slug,layout,version,live_revision_id,content FROM ec_magazine WHERE id=${q(remote.id)};`])[0].results[0];
if(confirmed.content!==local.content||confirmed.live_revision_id!==revision.id||confirmed.version!==remote.version+1)throw Error('Production mismatch');
fs.writeFileSync('scratch/resale-production-confirmed.json',JSON.stringify(confirmed,null,2));
console.log(JSON.stringify({verified:true,id:confirmed.id,version:confirmed.version,layout:confirmed.layout}));
