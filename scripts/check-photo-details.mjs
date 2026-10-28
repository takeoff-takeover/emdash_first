async function checkDetails() {
  const ids = [
    'P90659264', 'P90659266', 'P90659267', 'P90659268', 'P90659270', 'P90659271',
    'P90655770', 'P90655771', 'P90655772', 'P90655773', 'P90655774', 'P90655776', 'P90655777', 'P90655778'
  ];

  for (const id of ids) {
    try {
      const res = await fetch(`https://www.press.bmwgroup.com/global/photo/detail/${id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const txt = await res.text();
      // Look for caption or description
      const descMatch = txt.match(/<meta property="og:description" content="(.*?)"/);
      const titleMatch = txt.match(/<title>(.*?)<\/title>/);
      const imgMatch = txt.match(/https:\/\/mediapool\.bmwgroup\.com\/cache\/P9\/[^\s"'<>]+\.jpg/g);
      const largeImg = imgMatch ? imgMatch.find(u => u.includes('225') || u.includes('224')) : null;
      console.log(`[${id}]: desc=${descMatch ? descMatch[1] : ''}`);
      console.log(`       img=${largeImg}`);
    } catch (e) {}
  }
}
checkDetails();
