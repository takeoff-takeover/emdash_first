import fs from 'fs';
import path from 'path';

function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  let count = 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      count += copyDirRecursive(srcPath, destPath);
    } else {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        count++;
      }
    }
  }
  return count;
}

// 1. Copy wp-content/uploads/2026 to uploads/2026
const copiedToUploads = copyDirRecursive('public/wp-content/uploads/2026', 'public/uploads/2026');
console.log(`Copied ${copiedToUploads} files from wp-content/uploads/2026 to uploads/2026`);

// 2. Copy uploads/2026 to wp-content/uploads/2026
const copiedToWp = copyDirRecursive('public/uploads/2026', 'public/wp-content/uploads/2026');
console.log(`Copied ${copiedToWp} files from uploads/2026 to wp-content/uploads/2026`);
