async function test() {
  const ids = [
    'P90659268-bmw-ix4-highlight-shots-10-26-2248px.jpg',
    'P90655718-bmw-ix4-m60-xdrive-driving-shots-10-26-2250px.jpg',
    'P90655718-bmw-ix4-m60-xdrive-driving-shots-10-26-2248px.jpg',
    'P90655740-bmw-ix4-50-xdrive-driving-shots-10-26-2250px.jpg',
    'P90655770-bmw-ix4-m60-xdrive-static-10-26-2250px.jpg',
    // 329px thumbs exist, check them
    'P90655718-bmw-ix4-m60-xdrive-driving-shots-10-26-329px.jpg',
    'P90655740-bmw-ix4-50-xdrive-driving-shots-10-26-330px.jpg',
    'P90655770-bmw-ix4-m60-xdrive-static-10-26-329px.jpg'
  ];

  for (const name of ids) {
    const folder = name.includes('202610') || name.startsWith('P90659') ? '202610' : '202609';
    const id = name.split('-')[0];
    const url = `https://mediapool.bmwgroup.com/cache/P9/${folder}/${id}/${name}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(res.status, url);
    } catch (e) {
      console.log('ERR', url);
    }
  }
}
test();
