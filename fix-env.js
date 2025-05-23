/**
 * Quick Fix for Environment Variables
 * 
 * This script sets USE_GEORGE_KEY to false in the .env.local file
 * to fix the auto-complete error without requiring OpenAI API key.
 */

const fs = require('fs');
const path = require('path');

// Path to .env.local file
const envFilePath = path.join(__dirname, '.env.local');

console.log('\n=== Quick Fix for Environment Variables ===\n');

try {
  // Check if .env.local exists
  if (!fs.existsSync(envFilePath)) {
    // Create new .env.local file with minimum required config
    const minConfig = `# Environment Variables - Generated by fix-env.js
USE_GEORGE_KEY=false
NEXT_PUBLIC_ENABLE_AUTO_COMPLETE=true
`;
    fs.writeFileSync(envFilePath, minConfig);
    console.log('Created new .env.local file with USE_GEORGE_KEY=false');
  } else {
    // Read existing .env.local file
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Check if USE_GEORGE_KEY exists in the file
    if (envContent.includes('USE_GEORGE_KEY=')) {
      // Replace USE_GEORGE_KEY value
      envContent = envContent.replace(/USE_GEORGE_KEY=.*$/m, 'USE_GEORGE_KEY=false');
      fs.writeFileSync(envFilePath, envContent);
      console.log('Updated .env.local file: Set USE_GEORGE_KEY=false');
    } else {
      // Add USE_GEORGE_KEY at the beginning of the file
      envContent = `USE_GEORGE_KEY=false\n${envContent}`;
      fs.writeFileSync(envFilePath, envContent);
      console.log('Added USE_GEORGE_KEY=false to .env.local file');
    }
  }
  
  console.log('\n=== Fix Complete ===');
  console.log('You can now restart the development server with:');
  console.log('pnpm dev');
} catch (error) {
  console.error('Error:', error);
} 