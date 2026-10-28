async function findGallery() {
  const queryUrl = 'https://www.press.bmwgroup.com/global/search/result?keywords=iX4&type=photo';
  const res = await fetch(queryUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  console.log('Search status:', res.status);
  const html = await res.text();
  console.log('Search len:', html.length);
  const links = [...html.matchAll(/https:\/\/mediapool\.bmwgroup\.com\/cache\/P9\/[^\s"'<>]+/g)].map(m => m[0]);
  console.log('Found media links in search:');
  for (const l of [...new Set(links)]) {
    console.log(l);
  }
}
findGallery();
