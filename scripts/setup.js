#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up StyleTransform SaaS...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created. Please fill in your environment variables.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..', 'frontend') });
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..', 'backend') });
  console.log('✅ Dependencies installed successfully.\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Fill in your environment variables in .env');
console.log('2. Set up Firebase project and add credentials');
console.log('3. Set up Cloudinary account and add credentials');
console.log('4. Set up Stripe account and add credentials');
console.log('5. Set up Replicate account and add API token');
console.log('6. Run "npm run dev" to start development server');
console.log('\nFor detailed setup instructions, see README.md');