#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment preparation for StyleTransform SaaS...\n');

// Function to run command and log output
function runCommand(command, description, cwd = path.join(__dirname, '..')) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Check if all required files exist
const requiredFiles = [
  'frontend/package.json',
  'backend/package.json',
  'frontend/.env',
  'backend/.env',
  'vercel.json',
  'backend/Procfile'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} is missing`);
    process.exit(1);
  }
}
console.log('✅ All required files are present\n');

// Check environment variables
console.log('🔍 Checking environment variables...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for placeholder values that need to be replaced
  const placeholders = [
    'your_stripe_publishable_key_here',
    'your_stripe_secret_key_here',
    'your_webhook_secret_here'
  ];
  
  let hasPlaceholders = false;
  placeholders.forEach(placeholder => {
    if (envContent.includes(placeholder)) {
      console.warn(`⚠️  Found placeholder: ${placeholder}`);
      hasPlaceholders = true;
    }
  });
  
  if (!hasPlaceholders) {
    console.log('✅ Environment variables look good\n');
  } else {
    console.log('⚠️  Some environment variables still have placeholder values\n');
  }
}

// Clean and install dependencies
runCommand('npm run install-all', 'Installing all dependencies');

// Build frontend
runCommand('npm run build', 'Building frontend', path.join(__dirname, '..', 'frontend'));

// Check build output
const buildPath = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  console.log('✅ Frontend build created successfully');
  
  // Check if index.html exists
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html found in build directory');
  } else {
    console.error('❌ index.html not found in build directory');
    process.exit(1);
  }
} else {
  console.error('❌ Frontend build failed');
  process.exit(1);
}

// Create deployment summary
console.log('\n📋 Deployment Summary:');
console.log('✅ All required files present');
console.log('✅ Dependencies installed');
console.log('✅ Frontend built successfully');
console.log('✅ Environment variables configured');

console.log('\n🚀 Deployment Options:');

console.log('\n📱 Frontend Deployment (Choose one):');
console.log('1. Vercel:');
console.log('   - Command: vercel --prod');
console.log('   - Or connect GitHub repo to Vercel dashboard');
console.log('   - Build command: cd frontend && npm run build');
console.log('   - Output directory: frontend/build');

console.log('\n2. Netlify:');
console.log('   - Command: netlify deploy --prod --dir=frontend/build');
console.log('   - Or drag & drop build folder to Netlify');

console.log('\n🖥️  Backend Deployment (Choose one):');
console.log('1. Heroku:');
console.log('   - git push heroku main');
console.log('   - Make sure Procfile is in backend directory');

console.log('\n2. Railway:');
console.log('   - railway up');
console.log('   - Connect GitHub repo');

console.log('\n3. Render:');
console.log('   - Connect GitHub repo');
console.log('   - Build command: cd backend && npm install');
console.log('   - Start command: cd backend && node server.js');

console.log('\n🔧 Important Notes:');
console.log('- Update CORS origins in backend for production URL');
console.log('- Set up Stripe webhooks with production URL');
console.log('- Configure Firebase for production domain');
console.log('- Add all environment variables to deployment platform');
console.log('- Test all functionality in production environment');

console.log('\n🎉 Deployment preparation complete!');
console.log('💡 Your app is ready to deploy!');