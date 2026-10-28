import fs from 'fs';
import { ix4Gallery, ix4PortableText } from './build-ix4-content.mjs';

function patchMagazineSlug() {
  const filePath = 'src/pages/magazine/[slug].astro';
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace ix4Gallery
  const galleryRegex = /const ix4Gallery = \[[\s\S]*?\n\];/;
  const newGalleryStr = `const ix4Gallery = ${JSON.stringify(ix4Gallery, null, 2)};`;
  if (galleryRegex.test(code)) {
    code = code.replace(galleryRegex, newGalleryStr);
    console.log('Replaced ix4Gallery in magazine/[slug].astro');
  } else {
    console.warn('Could not match ix4Gallery in magazine/[slug].astro');
  }

  // Replace staticArticlesCatalog ix4 content
  const ix4CatalogRegex = /("2027_new_bmw_ix4_neue_klasse":\s*\{[\s\S]*?featured_image:\s*)"[^"]+"([\s\S]*?content:\s*)\[[\s\S]*?\n\t\t\t\]\s*\}/;
  if (ix4CatalogRegex.test(code)) {
    code = code.replace(
      ix4CatalogRegex,
      `$1"/uploads/ix4/key-visual.jpg"$2${JSON.stringify(ix4PortableText, null, 3)}}`
    );
    console.log('Replaced staticArticlesCatalog iX4 content in magazine/[slug].astro');
  } else {
    console.warn('Could not match staticArticlesCatalog in magazine/[slug].astro');
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Saved magazine/[slug].astro');
}

function patchPostsSlug() {
  const filePath = 'src/pages/posts/[slug].astro';
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace staticArticlesCatalog ix4 content
  const ix4CatalogRegex = /("2027_new_bmw_ix4_neue_klasse":\s*\{[\s\S]*?featured_image:\s*)"[^"]+"([\s\S]*?content:\s*)\[[\s\S]*?\n\t\t\t\]\s*\}/;
  if (ix4CatalogRegex.test(code)) {
    code = code.replace(
      ix4CatalogRegex,
      `$1"/uploads/ix4/key-visual.jpg"$2${JSON.stringify(ix4PortableText, null, 3)}}`
    );
    console.log('Replaced staticArticlesCatalog iX4 content in posts/[slug].astro');
  } else {
    console.warn('Could not match staticArticlesCatalog in posts/[slug].astro');
  }

  // Also check if ix4Gallery exists in posts/[slug].astro
  const galleryRegex = /const ix4Gallery = \[[\s\S]*?\n\];/;
  if (galleryRegex.test(code)) {
    code = code.replace(galleryRegex, `const ix4Gallery = ${JSON.stringify(ix4Gallery, null, 2)};`);
    console.log('Replaced ix4Gallery in posts/[slug].astro');
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Saved posts/[slug].astro');
}

patchMagazineSlug();
patchPostsSlug();
