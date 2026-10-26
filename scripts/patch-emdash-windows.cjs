const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'node_modules', 'emdash', 'dist');
if (!fs.existsSync(distDir)) {
  process.exit(0);
}

const files = fs.readdirAllSync ? fs.readdirAllSync(distDir) : fs.readdirSync(distDir);
for (const file of files) {
  if (file.startsWith('virtual-modules-') && file.endsWith('.mjs')) {
    const filePath = path.join(distDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix descriptor.entrypoint Windows backslash
    if (content.includes('imports.push(`import ${varName} from "${descriptor.entrypoint}";`);')) {
      content = content.replace(
        'if (descriptor.format === "standard") {',
        'const normalizedEntrypoint = descriptor.entrypoint ? descriptor.entrypoint.replace(/\\\\/g, "/") : "";\n\t\tif (descriptor.format === "standard") {'
      );
      content = content.replace(
        'imports.push(`import ${varName} from "${descriptor.entrypoint}";`);',
        'imports.push(`import ${varName} from "${normalizedEntrypoint}";`);'
      );
      content = content.replace(
        'imports.push(`import { createPlugin as ${varName} } from "${descriptor.entrypoint}";`);',
        'imports.push(`import { createPlugin as ${varName} } from "${normalizedEntrypoint}";`);'
      );
      modified = true;
    }

    // Fix descriptor.adminEntry Windows backslash
    if (content.includes('imports.push(`import * as ${varName} from "${descriptor.adminEntry}";`);')) {
      content = content.replace(
        'imports.push(`import * as ${varName} from "${descriptor.adminEntry}";`);',
        'const normalizedAdminEntry = descriptor.adminEntry ? descriptor.adminEntry.replace(/\\\\/g, "/") : "";\n\t\timports.push(`import * as ${varName} from "${normalizedAdminEntry}";`);'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[patch] Patched Windows path support in ${file}`);
    }
  }
}
