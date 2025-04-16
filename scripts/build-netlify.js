
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('Starting Netlify build process...');

try {
  // Clear any TypeScript build cache that might cause issues
  const tsBuildInfoPath = path.join(rootDir, 'tsconfig.tsbuildinfo');
  if (fs.existsSync(tsBuildInfoPath)) {
    console.log('Removing TypeScript build cache...');
    fs.unlinkSync(tsBuildInfoPath);
  }
  
  // Run Vite build using only TypeScript for transpilation
  console.log('Building with Vite...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
