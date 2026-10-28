async function scan() {
  const results = [];
  // Scan around 90655700 to 90655780 and 90659260 to 90659280
  const targets = [];
  for (let id = 90655700; id <= 90655780; id++) {
    targets.push({ id: `P0${id}`.slice(-9), folder: '202609' }); // e.g. P90655718
  }
  for (let id = 90659260; id <= 90659280; id++) {
    targets.push({ id: `P0${id}`.slice(-9), folder: '202610' });
  }

  console.log(`Checking ${targets.length} candidates...`);

  // We can fetch the PressClub asset detail or HEAD cache
  for (const t of targets) {
    const assetUrl = `https://www.press.bmwgroup.com/global/photo/detail/${t.id}`;
    try {
      const res = await fetch(assetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'manual'
      });
      if (res.status === 200) {
        const text = await res.text();
        const titleMatch = text.match(/<title>(.*?)<\/title>/);
        const imgMatch = text.match(/https:\/\/mediapool\.bmwgroup\.com\/cache\/P9\/[^\s"'<>]+225\dpx\.jpg/);
        console.log(`FOUND ${t.id}: status=${res.status}, title=${titleMatch ? titleMatch[1] : ''}, img=${imgMatch ? imgMatch[0] : 'no 2250px'}`);
        results.push({ id: t.id, title: titleMatch ? titleMatch[1] : '', img: imgMatch ? imgMatch[0] : null });
      }
    } catch (e) {
      // ignore
    }
  }

  console.log(`Scan complete. Found ${results.length} valid assets.`);
}
scan();
