async function run() {
  try {
    const res = await fetch('https://www.press.bmwgroup.com/global/article/detail/T0461402EN/the-new-bmw-ix4', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('HTML len:', html.length);
    const matches = [...new Set([...html.matchAll(/https:\/\/mediapool\.bmwgroup\.com\/[^\s"'<>]+/g)].map(m => m[0]))];
    console.log('Found unique mediapool links:', matches.length);
    for (const m of matches.slice(0, 30)) {
      console.log(m);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
run();
