import fetch from 'node-fetch';

async function checkForm() {
  const res = await fetch('http://localhost:4321/_emdash/admin/login');
  const text = await res.text();
  
  // Find forms, inputs, buttons, etc.
  const formMatches = text.match(/<form[^>]*>[\s\S]*?<\/form>/gi) || [];
  console.log('Forms found:', formMatches.length);
  formMatches.forEach((f, i) => console.log(`Form ${i}:`, f));

  // If client-side rendered (React component)
  if (formMatches.length === 0) {
    console.log('Checking for React / client-side components...');
    const bodyIdx = text.indexOf('<body');
    console.log(text.slice(bodyIdx, bodyIdx + 2000));
  }
}

checkForm();
