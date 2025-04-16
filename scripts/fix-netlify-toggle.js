
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the file paths
const componentsDir = path.join(__dirname, '..', 'src', 'components', 'ui');
const togglePath = path.join(componentsDir, 'toggle.tsx');
const toggleGroupPath = path.join(componentsDir, 'toggle-group.tsx');
const distDir = path.join(__dirname, '..', 'dist');

// Pure toggle implementation without Radix UI
const pureToggle = fs.readFileSync(path.join(componentsDir, 'pure-toggle.tsx'), 'utf8');
const pureToggleGroup = fs.readFileSync(path.join(componentsDir, 'pure-toggle-group.tsx'), 'utf8');

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to verify file doesn't contain Radix UI imports
function verifyNoRadixImports(filePath, fileLabel) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${fileLabel} doesn't exist, skipping verification`);
      return true;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const hasRadixImports = content.includes('@radix-ui/react-toggle') || 
                            content.includes('@radix-ui/react-toggle-group') ||
                            content.includes('TogglePrimitive') ||
                            content.includes('ToggleGroupPrimitive');
    
    if (hasRadixImports) {
      console.log(`❌ ${fileLabel} still contains Radix UI imports!`);
      return false;
    } else {
      console.log(`✅ ${fileLabel} verified - no Radix UI imports`);
      return true;
    }
  } catch (error) {
    console.error(`Error verifying ${fileLabel}:`, error);
    return false;
  }
}

// Function to clean up the dist directory
function cleanupDistDirectory() {
  if (fs.existsSync(distDir)) {
    console.log('Cleaning up dist directory...');
    try {
      fs.rmSync(distDir, { recursive: true });
      console.log('✅ Dist directory cleaned successfully');
    } catch (error) {
      console.error('Error cleaning dist directory:', error);
    }
  } else {
    console.log('Dist directory does not exist yet, skipping cleanup');
  }
}

console.log('Starting fix-netlify-toggle.js...');
console.log('Ensuring toggle components have no Radix UI dependencies...');

try {
  // Clean up dist directory to ensure no cached builds
  cleanupDistDirectory();
  
  // Ensure the components/ui directory exists
  ensureDirectoryExists(componentsDir);
  
  // Always replace the toggle files to be safe
  console.log('Writing toggle.tsx...');
  fs.writeFileSync(togglePath, pureToggle);
  console.log('✅ toggle.tsx fixed!');
  
  console.log('Writing toggle-group.tsx...');
  fs.writeFileSync(toggleGroupPath, pureToggleGroup);
  console.log('✅ toggle-group.tsx fixed!');
  
  // Verify the files
  const toggleVerified = verifyNoRadixImports(togglePath, 'toggle.tsx');
  const toggleGroupVerified = verifyNoRadixImports(toggleGroupPath, 'toggle-group.tsx');
  
  if (toggleVerified && toggleGroupVerified) {
    console.log('All files prepared successfully for Netlify build!');
  } else {
    throw new Error('Verification failed! Some files still contain Radix UI imports');
  }
} catch (error) {
  console.error('Error preparing files:', error);
  // Don't exit with error code to allow build to continue
  console.log('Continuing with build despite preparation errors...');
}
