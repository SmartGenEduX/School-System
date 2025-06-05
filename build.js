const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building SmartGenEduX for Vercel deployment...');

// Build client
console.log('📦 Building client...');
execSync('npm run build:client', { stdio: 'inherit' });

// Ensure server is compiled
console.log('🔧 Preparing server for Vercel...');
execSync('npm run build:server', { stdio: 'inherit' });

// Copy assets to dist
console.log('📁 Copying assets...');
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy attached assets to dist/assets
const attachedAssetsDir = 'attached_assets';
const distAssetsDir = 'dist/assets';

if (fs.existsSync(attachedAssetsDir)) {
  if (!fs.existsSync(distAssetsDir)) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
  }
  
  const files = fs.readdirSync(attachedAssetsDir);
  files.forEach(file => {
    fs.copyFileSync(
      path.join(attachedAssetsDir, file),
      path.join(distAssetsDir, file)
    );
  });
  console.log('✅ Assets copied successfully');
}

console.log('🚀 Build complete! Ready for Vercel deployment.');