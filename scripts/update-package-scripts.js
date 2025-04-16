
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '..', 'package.json');

console.log('Updating package.json scripts...');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update the dev script to use our start-dev.js script
  packageJson.scripts = {
    ...packageJson.scripts,
    "dev": "node scripts/start-dev.js",
    "build:netlify": "node scripts/build-netlify.js"
  };
  
  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json scripts updated successfully');
} catch (error) {
  console.error('Error updating package.json:', error);
  process.exit(1);
}
