async function inspectMagazine() {
  const html = await fetch('https://my-emdash-site.kaz130.workers.dev/magazine/').then(r => r.text());
  console.log('HTML size:', html.length);
  console.log('has ld+json:', html.includes('application/ld+json'));
  const ldMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  console.log('ld count:', ldMatch ? ldMatch.length : 0);
  if (ldMatch) console.log('first ld:', ldMatch[0]);
  console.log('has canonical:', html.includes('rel="canonical"'));
  console.log('has og:image:', html.includes('og:image'));
  console.log('has og:title:', html.includes('og:title'));
  console.log('has h1:', html.includes('<h1'));
}
inspectMagazine();
