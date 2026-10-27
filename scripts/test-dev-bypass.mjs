import fetch from 'node-fetch';

async function testDevBypass() {
  const url = 'http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin';
  const res = await fetch(url, { redirect: 'manual' });
  console.log('Dev bypass status:', res.status);
  console.log('Location header:', res.headers.get('location'));
  console.log('Set-Cookie header:', res.headers.get('set-cookie'));
  const text = await res.text();
  console.log('Response body:', text);
}

testDevBypass();
