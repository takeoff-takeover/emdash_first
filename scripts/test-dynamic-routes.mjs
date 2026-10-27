import fetch from 'node-fetch';

async function check() {
  const routes = ['/bmw', '/mini'];
  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:4321${r}`);
      const text = await res.text();
      console.log(`Route ${r}: status = ${res.status}, length = ${text.length}`);
      
      // Check for vehicle cards and location cards
      const vehicleMatches = text.match(/data-elementor-id="143"/g) || [];
      const locationMatches = text.match(/data-elementor-id="7256"/g) || [];
      console.log(`  -> Vehicle cards count (template 143): ${vehicleMatches.length}`);
      console.log(`  -> Location cards count (template 7256): ${locationMatches.length}`);
    } catch (e) {
      console.error(`Route ${r} error:`, e.message);
    }
  }
}

check();
