import fetch from 'node-fetch';

async function testAdminWithCookie() {
  // 1. Hit dev-bypass
  const bypassRes = await fetch('http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin', { redirect: 'manual' });
  const rawCookies = bypassRes.headers.raw()['set-cookie'];
  const cookieHeader = rawCookies.map(c => c.split(';')[0]).join('; ');
  console.log('Obtained cookies:', cookieHeader);

  // 2. Request /_emdash/admin with the cookie
  const adminRes = await fetch('http://localhost:4321/_emdash/admin', {
    headers: { Cookie: cookieHeader },
    redirect: 'manual'
  });
  console.log('/_emdash/admin status:', adminRes.status, 'location:', adminRes.headers.get('location'));
  
  // 3. Request /_emdash/api/auth/me to check authenticated user
  const meRes = await fetch('http://localhost:4321/_emdash/api/auth/me', {
    headers: { Cookie: cookieHeader }
  });
  console.log('/_emdash/api/auth/me status:', meRes.status);
  console.log('/_emdash/api/auth/me body:', await meRes.text());
}

testAdminWithCookie();
