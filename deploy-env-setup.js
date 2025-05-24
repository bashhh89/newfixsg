/**
 * Environment Variables Setup for EasyPanel Deployment
 * 
 * This script reads your local .env.local file and generates
 * output that can be pasted directly into EasyPanel's environment variables.
 */

const fs = require('fs');
const path = require('path');

// Path to your .env.local file
const envFilePath = path.join(process.cwd(), '.env.local');

try {
  console.log('Reading environment variables from .env.local...\n');
  
  if (!fs.existsSync(envFilePath)) {
    console.error('❌ Error: .env.local file not found!');
    process.exit(1);
  }
  
  const envFileContent = fs.readFileSync(envFilePath, 'utf8');
  const envLines = envFileContent.split('\n');
  
  // Format for easy copy-paste into EasyPanel
  console.log('====== COPY EVERYTHING BELOW THIS LINE ======');
  console.log('Environment variables from your .env.local file:');
  console.log('');
  
  let validEnvVars = 0;
  
  envLines.forEach(line => {
    // Skip comments and empty lines
    if (line.trim() === '' || line.trim().startsWith('#')) {
      return;
    }
    
    // Parse variable
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      console.log(`${key.trim()}=${value.trim()}`);
      validEnvVars++;
    }
  });
  
  console.log('');
  console.log(`✅ Found ${validEnvVars} environment variables.`);
  console.log('====== COPY EVERYTHING ABOVE THIS LINE ======');
  console.log('');
  console.log('INSTRUCTIONS:');
  console.log('1. Copy all the variables above');
  console.log('2. In EasyPanel, go to your app → Settings → Environment Variables');
  console.log('3. Paste all variables and save');
  
} catch (error) {
  console.error('❌ Error reading .env.local file:', error.message);
  process.exit(1);
} 