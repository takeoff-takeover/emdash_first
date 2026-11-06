async function checkDetails() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const html = await (await fetch('https://www.nicole.co.jp/')).text();
  const ldMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  console.log('JSON-LD count:', ldMatch ? ldMatch.length : 0);
  if (ldMatch) {
    ldMatch.forEach((ld, i) => console.log(`LD ${i}:\n`, ld.slice(0, 300)));
  }
  const lText = await (await fetch('https://www.nicole.co.jp/llms.txt')).text();
  console.log('llms.txt content:\n', lText.slice(0, 300));
}
checkDetails();
