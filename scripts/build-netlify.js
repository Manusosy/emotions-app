
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('Starting Netlify build process...');

try {
  // First, ensure we have the platform-specific dependencies
  console.log('Installing platform-specific dependencies for Netlify...');
  try {
    execSync('npm install --no-save @rollup/rollup-linux-x64-gnu@4.9.1 @rollup/rollup-linux-x64-musl@4.9.1', { 
      stdio: 'inherit',
      cwd: rootDir
    });
    console.log('✅ Platform-specific dependencies installed');
  } catch (error) {
    console.warn('⚠️ Could not install platform-specific dependencies, but continuing with fallbacks:', error.message);
  }
  
  // Clear any TypeScript build cache that might cause issues
  const tsBuildInfoPath = path.join(rootDir, 'tsconfig.tsbuildinfo');
  if (fs.existsSync(tsBuildInfoPath)) {
    console.log('Removing TypeScript build cache...');
    fs.unlinkSync(tsBuildInfoPath);
  }
  
  // Ensure toggle components are properly set up
  console.log('Fixing toggle components for Netlify...');
  try {
    execSync('node scripts/fix-radix.js', { 
      stdio: 'inherit',
      cwd: rootDir
    });
    console.log('✅ Toggle components fixed');
  } catch (error) {
    console.warn('⚠️ Could not fix toggle components, but continuing:', error.message);
  }
  
  // Copy fallback implementations for Rollup platform-specific modules
  console.log('Ensuring Rollup fallbacks are available...');
  const rollupFallbackSrc = path.join(rootDir, 'src', 'rollup-fallback.js');
  if (fs.existsSync(rollupFallbackSrc)) {
    // Make sure the module is loaded during build
    console.log('Rollup fallback module is available.');
  } else {
    console.warn('Rollup fallback module not found!');
  }
  
  // Run Vite build with adjusted settings to avoid TS errors
  console.log('Building with Vite...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    cwd: rootDir,
    env: {
      ...process.env,
      // Avoid using tsconfig builds that might conflict with noEmit
      TS_NODE_COMPILER_OPTIONS: '{"module":"commonjs","target":"es2019","noEmit":false}'
    }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
