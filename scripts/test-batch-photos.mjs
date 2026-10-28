async function testBatch() {
  const ids = [];
  for (let i = 710; i <= 780; i++) {
    ids.push(`P90655${i}`);
  }
  for (let i = 260; i <= 280; i++) {
    ids.push(`P90659${i}`);
  }

  console.log(`Checking ${ids.length} IDs with GET Range...`);
  
  // Test a few filename patterns
  const suffixes = [
    '2250px.jpg',
    '2248px.jpg',
    '329px.jpg',
    '330px.jpg'
  ];

  // We can also fetch the html page https://www.press.bmwgroup.com/global/photo/detail/ID
  // Let's test 10 at a time
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const promises = chunk.map(async (id) => {
      try {
        const res = await fetch(`https://www.press.bmwgroup.com/global/photo/detail/${id}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          redirect: 'manual'
        });
        if (res.status === 200) {
          const txt = await res.text();
          const match = txt.match(/https:\/\/mediapool\.bmwgroup\.com\/cache\/P9\/[^\s"'<>]+\.jpg/g);
          const title = txt.match(/<title>(.*?)<\/title>/)?.[1] || '';
          return { id, title, urls: match ? [...new Set(match)] : [] };
        }
      } catch (e) {}
      return null;
    });
    const results = (await Promise.all(promises)).filter(Boolean);
    for (const r of results) {
      console.log(`FOUND: ${r.id} - ${r.title}`);
      for (const u of r.urls.filter(u => u.includes('225') || u.includes('224') || u.includes('1920'))) {
        console.log(`   -> ${u}`);
      }
    }
  }
}
testBatch();
