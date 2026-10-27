import fetch from 'node-fetch';

async function testAdmin() {
  const urls = [
    'http://localhost:4321/_emdash/admin',
    'http://localhost:4321/_emdash/admin/',
    'http://localhost:4321/_emdash/admin/posts'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { redirect: 'manual' });
      console.log(u, 'status:', res.status, 'location:', res.headers.get('location'));
      const text = await res.text();
      console.log('  length:', text.length, 'preview:', text.slice(0, 200).replace(/\s+/g, ' '));
    } catch (e) {
      console.log(u, 'error:', e.message);
    }
  }
}

testAdmin();
