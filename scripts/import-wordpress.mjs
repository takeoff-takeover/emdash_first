import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { parseWxrString, ulid, extractPlainText } from 'emdash';
import { gutenbergToPortableText } from '@emdash-cms/gutenberg-to-portable-text';

async function importWordPress() {
  console.log('=== Starting WordPress Import ===');

  const xmlPath = 'wordpress-export.xml';
  if (!fs.existsSync(xmlPath)) {
    throw new Error(`File ${xmlPath} not found!`);
  }

  const xml = fs.readFileSync(xmlPath, 'utf8');
  console.log('Parsing WXR export XML...');
  const data = await parseWxrString(xml);
  console.log(`Parsed WXR. Found ${data.posts.length} items and ${data.attachments.length} attachments.`);

  // 1. Build attachment mapping
  const attachmentMap = new Map();
  for (const att of data.attachments) {
    if (att.id && att.url) {
      attachmentMap.set(String(att.id), att.url);
    }
  }

  // 2. Read existing seed.json
  const seedPath = 'seed/seed.json';
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  // Backup seed.json
  fs.writeFileSync('seed/seed.json.bak', JSON.stringify(seed, null, 2));
  console.log('Backed up seed.json to seed/seed.json.bak');

  // 3. Process Taxonomies
  // Identify category & tag defs in seed
  let categoryTaxDef = seed.taxonomies.find(t => t.name === 'category');
  if (!categoryTaxDef) {
    categoryTaxDef = {
      name: 'category',
      label: 'Categories',
      labelSingular: 'Category',
      hierarchical: true,
      collections: ['posts'],
      terms: []
    };
    seed.taxonomies.push(categoryTaxDef);
  }

  let tagTaxDef = seed.taxonomies.find(t => t.name === 'tag');
  if (!tagTaxDef) {
    tagTaxDef = {
      name: 'tag',
      label: 'Tags',
      labelSingular: 'Tag',
      hierarchical: false,
      collections: ['posts'],
      terms: []
    };
    seed.taxonomies.push(tagTaxDef);
  }

  // Helper to normalize taxonomy slug
  function normalizeTaxSlug(rawSlug) {
    try {
      return decodeURIComponent(rawSlug).trim();
    } catch (e) {
      return rawSlug.trim();
    }
  }

  // Add WordPress categories to categoryTaxDef
  for (const cat of data.categories) {
    const slug = normalizeTaxSlug(cat.slug);
    if (!categoryTaxDef.terms.some(t => t.slug === slug || t.slug === cat.slug)) {
      categoryTaxDef.terms.push({
        slug,
        label: cat.name || slug
      });
    }
  }

  // Add WordPress tags to tagTaxDef
  for (const tag of data.tags) {
    const slug = normalizeTaxSlug(tag.slug);
    if (!tagTaxDef.terms.some(t => t.slug === slug || t.slug === tag.slug)) {
      tagTaxDef.terms.push({
        slug,
        label: tag.name || slug
      });
    }
  }

  console.log(`Taxonomies updated. Categories: ${categoryTaxDef.terms.length}, Tags: ${tagTaxDef.terms.length}`);

  // 4. Process Posts
  const existingSeedPosts = (seed.content?.posts || []).filter(p => 
    p.slug === '2027_new_bmw_3series_neue_klasse' || p.slug === '202608_bmw_kids_mechanic'
  );

  const importedPosts = [];
  const usedSlugs = new Set(existingSeedPosts.map(p => p.slug));

  const wpPosts = data.posts.filter(p => p.postType === 'post');
  console.log(`Processing ${wpPosts.length} WordPress posts...`);

  for (const wpPost of wpPosts) {
    let slug = wpPost.postName || '';
    try {
      slug = decodeURIComponent(slug).trim();
    } catch (e) {}

    if (!slug) {
      slug = `post-${wpPost.id}`;
    }

    let baseSlug = slug;
    let counter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(slug);

    const isPublished = wpPost.status === 'publish';
    const status = isPublished ? 'published' : 'draft';

    // Featured image
    const thumbId = wpPost.meta?.get('_thumbnail_id');
    const thumbUrl = thumbId ? attachmentMap.get(String(thumbId)) : null;

    // Convert content to Portable Text
    let pt = [];
    try {
      pt = await gutenbergToPortableText(wpPost.content || '');
    } catch (e) {
      console.warn(`Failed to convert content for post ${wpPost.id} "${wpPost.title}":`, e.message);
      pt = [
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: wpPost.content || '' }]
        }
      ];
    }

    // Excerpt
    let excerpt = wpPost.excerpt ? wpPost.excerpt.replace(/<[^>]+>/g, '').trim() : '';
    if (!excerpt && pt.length > 0) {
      try {
        const fullText = extractPlainText(pt);
        excerpt = fullText.slice(0, 160).replace(/\s+/g, ' ').trim() + (fullText.length > 160 ? '...' : '');
      } catch (e) {}
    }

    // Date
    const rawDate = wpPost.postDate || wpPost.pubDate || new Date().toISOString();
    let publishedAt;
    try {
      publishedAt = new Date(rawDate).toISOString();
    } catch (e) {
      publishedAt = new Date().toISOString();
    }

    // Taxonomies
    const postCategories = (wpPost.categories || []).map(normalizeTaxSlug);
    const postTags = (wpPost.tags || []).map(normalizeTaxSlug);

    const postItem = {
      id: ulid(),
      wpId: wpPost.id,
      slug,
      status,
      published_at: publishedAt,
      taxonomies: {
        category: postCategories,
        tag: postTags
      },
      data: {
        title: wpPost.title || 'Untitled',
        excerpt,
        featured_image: thumbUrl ? { src: thumbUrl, alt: wpPost.title || '' } : null,
        related_location: '',
        content: pt
      }
    };

    importedPosts.push(postItem);
  }

  console.log(`Converted ${importedPosts.length} posts.`);

  // 5. Process Pages
  const existingSeedPages = (seed.content?.pages || []).filter(p => p.slug === 'about');
  const importedPages = [];
  const usedPageSlugs = new Set(existingSeedPages.map(p => p.slug));

  const wpPages = data.posts.filter(p => p.postType === 'page');
  console.log(`Processing ${wpPages.length} WordPress pages...`);

  for (const wpPage of wpPages) {
    let slug = wpPage.postName || '';
    try {
      slug = decodeURIComponent(slug).trim();
    } catch (e) {}

    if (!slug) {
      slug = `page-${wpPage.id}`;
    }

    let baseSlug = slug;
    let counter = 1;
    while (usedPageSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    usedPageSlugs.add(slug);

    const isPublished = wpPage.status === 'publish';
    const status = isPublished ? 'published' : 'draft';

    let pt = [];
    try {
      pt = await gutenbergToPortableText(wpPage.content || '');
    } catch (e) {
      console.warn(`Failed to convert page ${wpPage.id} "${wpPage.title}":`, e.message);
      pt = [
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: wpPage.content || '' }]
        }
      ];
    }

    const rawDate = wpPage.postDate || wpPage.pubDate || new Date().toISOString();
    let publishedAt;
    try {
      publishedAt = new Date(rawDate).toISOString();
    } catch (e) {
      publishedAt = new Date().toISOString();
    }

    const pageItem = {
      id: ulid(),
      wpId: wpPage.id,
      slug,
      status,
      published_at: publishedAt,
      data: {
        title: wpPage.title || 'Untitled',
        content: pt
      }
    };

    importedPages.push(pageItem);
  }

  console.log(`Converted ${importedPages.length} pages.`);

  // 6. Update seed.json
  if (!seed.content) seed.content = {};
  seed.content.posts = [...existingSeedPosts, ...importedPosts];
  seed.content.pages = [...existingSeedPages, ...importedPages];

  fs.writeFileSync(seedPath, JSON.stringify(seed, null, '\t'), 'utf8');
  console.log(`Updated ${seedPath} with ${seed.content.posts.length} posts and ${seed.content.pages.length} pages.`);

  // 7. Update Active SQLite Database
  const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
  if (fs.existsSync(d1Dir)) {
    const files = fs.readdirSync(d1Dir);
    const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata'));
    if (dbFile) {
      const fullDbPath = path.join(d1Dir, dbFile);
      const backupDbPath = fullDbPath + '.bak';
      fs.copyFileSync(fullDbPath, backupDbPath);
      console.log(`Backed up SQLite database to ${backupDbPath}`);

      const db = new DatabaseSync(fullDbPath);

      // Begin transaction
      db.exec('BEGIN TRANSACTION;');

      try {
        // A. Insert missing taxonomy terms
        const existingTerms = db.prepare('SELECT id, name, slug FROM taxonomies').all();
        const termMap = new Map(); // `${name}:${slug}` -> id
        for (const t of existingTerms) {
          termMap.set(`${t.name}:${t.slug}`, t.id);
        }

        const insertTermStmt = db.prepare(`
          INSERT INTO taxonomies (id, name, slug, label, parent_id, data, locale, translation_group, sort_order)
          VALUES (?, ?, ?, ?, NULL, NULL, 'en', ?, ?)
        `);

        // Categories
        let catOrder = 10;
        for (const cat of categoryTaxDef.terms) {
          const key = `category:${cat.slug}`;
          if (!termMap.has(key)) {
            const termId = ulid();
            insertTermStmt.run(termId, 'category', cat.slug, cat.label, termId, catOrder++);
            termMap.set(key, termId);
          }
        }

        // Tags
        let tagOrder = 10;
        for (const tag of tagTaxDef.terms) {
          const key = `tag:${tag.slug}`;
          if (!termMap.has(key)) {
            const termId = ulid();
            insertTermStmt.run(termId, 'tag', tag.slug, tag.label, termId, tagOrder++);
            termMap.set(key, termId);
          }
        }

        // B. Clean up old demo posts if desired, or keep existing custom ones
        // Remove template demo posts: 'building-for-the-long-term', etc.
        const demoSlugs = [
          'building-for-the-long-term',
          'the-case-for-static',
          'learning-in-public',
          'small-tools-big-impact',
          'designing-with-constraints',
          'a-weekend-with-a-side-project',
          'notes-on-simplicity',
          'work-in-progress'
        ];
        for (const demoSlug of demoSlugs) {
          const row = db.prepare('SELECT id FROM ec_posts WHERE slug = ?').get(demoSlug);
          if (row) {
            db.prepare("DELETE FROM content_taxonomies WHERE collection = 'posts' AND entry_id = ?").run(row.id);
            db.prepare('DELETE FROM _emdash_fts_posts WHERE id = ?').run(row.id);
            db.prepare('DELETE FROM ec_posts WHERE id = ?').run(row.id);
          }
        }

        // C. Insert or update existing Nicole custom editorial posts
        for (const customPost of existingSeedPosts) {
          const existing = db.prepare('SELECT id FROM ec_posts WHERE slug = ?').get(customPost.slug);
          const featImg = customPost.data?.featured_image ? JSON.stringify(customPost.data.featured_image) : null;
          const contentJson = JSON.stringify(customPost.data?.content || []);
          const excerpt = customPost.data?.excerpt || '';
          const relLoc = customPost.data?.related_location || null;
          const pubAt = customPost.published_at || new Date().toISOString();

          if (!existing) {
            const postId = customPost.id || ulid();
            db.prepare(`
              INSERT INTO ec_posts (id, slug, status, author_id, primary_byline_id, created_at, updated_at, published_at, version, locale, translation_group, title, featured_image, content, excerpt, related_location)
              VALUES (?, ?, 'published', NULL, '01M5V4HMZD2NQACSFPGZZMFHZ6', ?, ?, ?, 1, 'en', ?, ?, ?, ?, ?, ?)
            `).run(
              postId,
              customPost.slug,
              pubAt,
              pubAt,
              pubAt,
              postId,
              customPost.data?.title || customPost.slug,
              featImg,
              contentJson,
              excerpt,
              relLoc
            );

            // FTS
            const plain = extractPlainText(customPost.data?.content || []);
            db.prepare(`
              INSERT INTO _emdash_fts_posts (id, locale, title, content)
              VALUES (?, 'en', ?, ?)
            `).run(postId, customPost.data?.title || '', plain);
          }
        }

        // D. Insert imported posts
        const insertPostStmt = db.prepare(`
          INSERT INTO ec_posts (id, slug, status, author_id, primary_byline_id, created_at, updated_at, published_at, version, locale, translation_group, title, featured_image, content, excerpt, related_location)
          VALUES (?, ?, ?, NULL, '01M5V4HMZD2NQACSFPGZZMFHZ6', ?, ?, ?, 1, 'en', ?, ?, ?, ?, ?, ?)
        `);

        const insertContentTaxStmt = db.prepare(`
          INSERT OR IGNORE INTO content_taxonomies (collection, entry_id, taxonomy_id, status, published_at, created_at)
          VALUES ('posts', ?, ?, ?, ?, ?)
        `);

        const insertFtsStmt = db.prepare(`
          INSERT INTO _emdash_fts_posts (id, locale, title, content)
          VALUES (?, 'en', ?, ?)
        `);

        for (const post of importedPosts) {
          const featImg = post.data.featured_image ? JSON.stringify(post.data.featured_image) : null;
          const contentJson = JSON.stringify(post.data.content);

          insertPostStmt.run(
            post.id,
            post.slug,
            post.status,
            post.published_at,
            post.published_at,
            post.published_at,
            post.id,
            post.data.title,
            featImg,
            contentJson,
            post.data.excerpt,
            post.data.related_location || null
          );

          // Content Taxonomies
          for (const catSlug of post.taxonomies.category) {
            const termId = termMap.get(`category:${catSlug}`);
            if (termId) {
              insertContentTaxStmt.run(post.id, termId, post.status, post.published_at, post.published_at);
            }
          }
          for (const tagSlug of post.taxonomies.tag) {
            const termId = termMap.get(`tag:${tagSlug}`);
            if (termId) {
              insertContentTaxStmt.run(post.id, termId, post.status, post.published_at, post.published_at);
            }
          }

          // FTS
          let plain = '';
          try {
            plain = extractPlainText(post.data.content);
          } catch (e) {}
          insertFtsStmt.run(post.id, post.data.title, plain);
        }

        // E. Insert imported pages into ec_pages
        const insertPageStmt = db.prepare(`
          INSERT INTO ec_pages (id, slug, status, author_id, created_at, updated_at, published_at, version, locale, translation_group, title, content)
          VALUES (?, ?, ?, NULL, ?, ?, ?, 1, 'en', ?, ?, ?)
        `);

        const insertFtsPageStmt = db.prepare(`
          INSERT INTO _emdash_fts_pages (id, locale, title, content)
          VALUES (?, 'en', ?, ?)
        `);

        for (const page of importedPages) {
          const contentJson = JSON.stringify(page.data.content);

          insertPageStmt.run(
            page.id,
            page.slug,
            page.status,
            page.published_at,
            page.published_at,
            page.published_at,
            page.id,
            page.data.title,
            contentJson
          );

          let plain = '';
          try {
            plain = extractPlainText(page.data.content);
          } catch (e) {}
          insertFtsPageStmt.run(page.id, page.data.title, plain);
        }

        db.exec('COMMIT;');
        console.log('SQLite database updated successfully!');
      } catch (err) {
        db.exec('ROLLBACK;');
        console.error('Error during SQLite transaction:', err);
        throw err;
      }
    }
  }

  console.log('=== WordPress Import Complete! ===');
}

importWordPress().catch(console.error);
