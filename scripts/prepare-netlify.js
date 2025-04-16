import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Clear cache directories that might cause issues
try {
  if (fs.existsSync(path.join(rootDir, 'node_modules', '.vite'))) {
    console.log('Removing .vite cache...');
    fs.rmSync(path.join(rootDir, 'node_modules', '.vite'), { recursive: true, force: true });
  }
  
  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    console.log('Removing old dist directory...');
    fs.rmSync(path.join(rootDir, 'dist'), { recursive: true, force: true });
  }
} catch (error) {
  console.error('Error cleaning directories:', error);
}

// Copy index-netlify.html to index.html if it exists
try {
  const netlifyIndexPath = path.join(rootDir, 'index-netlify.html');
  const indexPath = path.join(rootDir, 'index.html');
  
  if (fs.existsSync(netlifyIndexPath)) {
    console.log('Copying index-netlify.html to index.html...');
    fs.copyFileSync(netlifyIndexPath, indexPath);
  }
} catch (error) {
  console.error('Error copying index file:', error);
}

// Replace imports of @radix-ui components in toggle.tsx and toggle-group.tsx with custom implementations
try {
  const filesToCheck = [
    path.join(rootDir, 'src', 'components', 'ui', 'toggle.tsx'),
    path.join(rootDir, 'src', 'components', 'ui', 'toggle-group.tsx')
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`Checking imports in ${filePath}...`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace Radix UI imports with our custom ones
      content = content.replace(/import\s+\*\s+as\s+TogglePrimitive\s+from\s+["']@radix-ui\/react-toggle["'];?/g, '');
      content = content.replace(/import\s+\*\s+as\s+ToggleGroupPrimitive\s+from\s+["']@radix-ui\/react-toggle-group["'];?/g, '');
      
      // Write the modified content back
      fs.writeFileSync(filePath, content);
    }
  });
} catch (error) {
  console.error('Error processing component files:', error);
}

console.log('Netlify build preparation completed.'); 