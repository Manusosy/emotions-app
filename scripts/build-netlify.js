
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
  
  // Run Vite build with explicit TypeScript settings
  console.log('Building with Vite...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    cwd: rootDir,
    env: {
      ...process.env,
      // Set TypeScript compiler options as environment variables
      // Avoiding the --build flag that conflicts with noEmit
      TS_NODE_COMPILER_OPTIONS: '{"module":"commonjs","target":"es2019","noEmit":false}'
    }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
