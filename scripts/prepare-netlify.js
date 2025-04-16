
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
  
  // Clean up ALL TypeScript cache files
  console.log('Cleaning up TypeScript build artifacts...');
  
  // Remove tsconfig.tsbuildinfo
  const tsBuildInfoPath = path.join(rootDir, 'tsconfig.tsbuildinfo');
  if (fs.existsSync(tsBuildInfoPath)) {
    console.log('Removing TypeScript build info...');
    fs.unlinkSync(tsBuildInfoPath);
  }
  
  // Also check for other TypeScript cache files
  const cachePaths = [
    path.join(rootDir, '.tsbuildinfo'),
    path.join(rootDir, 'src', '.tsbuildinfo'),
    path.join(rootDir, 'node_modules', '.cache', 'typescript')
  ];
  
  cachePaths.forEach(cachePath => {
    if (fs.existsSync(cachePath)) {
      console.log(`Removing TypeScript cache at ${cachePath}...`);
      if (fs.statSync(cachePath).isDirectory()) {
        fs.rmSync(cachePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(cachePath);
      }
    }
  });
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

// Replace problematic files with our clean versions
try {
  // List of files to replace with clean versions
  const replacements = [
    {
      source: path.join(rootDir, 'src', 'components', 'ui', 'pure-toggle.tsx'),
      target: path.join(rootDir, 'src', 'components', 'ui', 'toggle.tsx')
    },
    {
      source: path.join(rootDir, 'src', 'components', 'ui', 'pure-toggle-group.tsx'),
      target: path.join(rootDir, 'src', 'components', 'ui', 'toggle-group.tsx')
    }
  ];
  
  replacements.forEach(({ source, target }) => {
    if (fs.existsSync(source) && fs.existsSync(target)) {
      console.log(`Replacing ${target} with ${source}...`);
      const sourceContent = fs.readFileSync(source, 'utf8');
      
      // For toggle-group.tsx, update the import path
      let modifiedContent = sourceContent;
      if (target.includes('toggle-group.tsx')) {
        modifiedContent = sourceContent.replace(
          /from\s+["']@\/components\/ui\/pure-toggle["']/g, 
          'from "@/components/ui/toggle"'
        );
      }
      
      fs.writeFileSync(target, modifiedContent);
    }
  });
  
  // Create mock modules for Radix UI packages
  const mockDir = path.join(rootDir, 'node_modules', '@radix-ui');
  
  // Create base directories if they don't exist
  if (!fs.existsSync(mockDir)) {
    fs.mkdirSync(mockDir, { recursive: true });
  }
  
  const mockToggleDir = path.join(mockDir, 'react-toggle');
  if (!fs.existsSync(mockToggleDir)) {
    fs.mkdirSync(mockToggleDir, { recursive: true });
  }
  
  const mockToggleGroupDir = path.join(mockDir, 'react-toggle-group');
  if (!fs.existsSync(mockToggleGroupDir)) {
    fs.mkdirSync(mockToggleGroupDir, { recursive: true });
  }
  
  // Create package.json files
  fs.writeFileSync(
    path.join(mockToggleDir, 'package.json'),
    JSON.stringify({
      name: "@radix-ui/react-toggle",
      version: "1.0.0",
      main: "index.js"
    }, null, 2)
  );
  
  fs.writeFileSync(
    path.join(mockToggleGroupDir, 'package.json'),
    JSON.stringify({
      name: "@radix-ui/react-toggle-group",
      version: "1.0.0",
      main: "index.js"
    }, null, 2)
  );
  
  // Create index.js files that export nothing
  fs.writeFileSync(
    path.join(mockToggleDir, 'index.js'),
    "export default {};"
  );
  
  fs.writeFileSync(
    path.join(mockToggleGroupDir, 'index.js'),
    "export default {};"
  );
  
} catch (error) {
  console.error('Error replacing component files:', error);
}

console.log('Netlify build preparation completed!');
