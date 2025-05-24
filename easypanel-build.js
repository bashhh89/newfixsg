/**
 * EasyPanel Deployment Build Script
 * 
 * This script is a simplified version of build-production.js designed to work
 * with EasyPanel's build process and avoid pnpm lockfile issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting EasyPanel build preparation...');

// Run the actual Next.js build
try {
  console.log('📦 Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Create the nixpacks config file
const nixpacksToml = `[phases.setup]
nixPkgs = ['nodejs', 'pnpm']

[phases.install]
cmds = ['pnpm install --no-frozen-lockfile']

[phases.build]
cmds = ['pnpm run build']

[start]
cmd = 'pnpm start'
`;

fs.writeFileSync(path.join(process.cwd(), 'nixpacks.toml'), nixpacksToml);
console.log('📝 Created nixpacks.toml file for EasyPanel deployment');

console.log('\n✅ EasyPanel build process completed!');
console.log('The application is now ready for deployment.'); 