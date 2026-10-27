import fetch from 'node-fetch';

async function testFullFlow() {
  // Step 1: Hit /admin
  const r1 = await fetch('http://localhost:4321/admin', { redirect: 'manual' });
  const loc1 = r1.headers.get('location');
  console.log('Step 1: /admin ->', r1.status, loc1);

  // Step 2: Follow to dev-bypass
  const r2 = await fetch('http://localhost:4321' + loc1, { redirect: 'manual' });
  const cookies = r2.headers.raw()['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log('Step 2: dev-bypass ->', r2.status, 'Session cookie acquired!');

  // Step 3: Access /_emdash/admin with the cookie
  const r3 = await fetch('http://localhost:4321/_emdash/admin', {
    headers: { Cookie: cookies },
    redirect: 'manual'
  });
  console.log('Step 3: /_emdash/admin -> Status:', r3.status, '(200 means logged in successfully!)');
}

testFullFlow();
