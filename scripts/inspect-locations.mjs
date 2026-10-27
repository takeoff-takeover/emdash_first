// scripts/inspect-locations.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function checkLocations() {
  const res = await fetch('https://www.nicole.co.jp/locations/');
  const html = await res.text();
  console.log('locations HTML length:', html.length);
  const articleIdx = html.indexOf('<article');
  console.log('article index:', articleIdx);
  if (articleIdx !== -1) {
    console.log(html.slice(articleIdx, articleIdx + 1000));
  } else {
    const mainIdx = html.indexOf('<main');
    console.log('main index:', mainIdx);
    if (mainIdx !== -1) {
      console.log(html.slice(mainIdx, mainIdx + 1000));
    }
  }
}

checkLocations();
