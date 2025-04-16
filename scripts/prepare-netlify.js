#!/usr/bin/env node

/**
 * This script prepares files for the Netlify build
 * by copying our pure implementations over any Radix UI versions
 */

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
const pureTogglePath = path.join(componentsDir, 'pure-toggle.tsx');
const pureToggleGroupPath = path.join(componentsDir, 'pure-toggle-group.tsx');

console.log('Starting prepare-netlify.js...');
console.log('Preparing files for Netlify build...');

try {
  // Check if pure toggle files exist
  if (fs.existsSync(pureTogglePath)) {
    console.log('Copying pure-toggle.tsx to toggle.tsx...');
    fs.copyFileSync(pureTogglePath, togglePath);
    console.log('✅ toggle.tsx replaced successfully!');
  } else {
    console.warn('⚠️ pure-toggle.tsx not found, skipping...');
  }

  if (fs.existsSync(pureToggleGroupPath)) {
    console.log('Copying pure-toggle-group.tsx to toggle-group.tsx...');
    fs.copyFileSync(pureToggleGroupPath, toggleGroupPath);
    console.log('✅ toggle-group.tsx replaced successfully!');
  } else {
    console.warn('⚠️ pure-toggle-group.tsx not found, skipping...');
  }

  console.log('All files prepared successfully for Netlify build!');
} catch (error) {
  console.error('Error preparing files:', error);
  // Don't exit with error code to allow build to continue even if this step fails
  console.log('Continuing with build despite preparation errors...');
}
