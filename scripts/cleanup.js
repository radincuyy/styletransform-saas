#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting cleanup process...\n');

// Files and directories to clean up
const filesToRemove = [
  // Temporary files
  'frontend/src/pages/Landing_minimal.js', // Already removed
  
  // Log files
  'backend/logs',
  'frontend/logs',
  
  // Cache directories
  'frontend/.cache',
  'backend/.cache',
  'frontend/node_modules/.cache',
  'backend/node_modules/.cache',
  
  // Test files that might exist
  'frontend/src/setupTests.js',
  'frontend/src/App.test.js',
  'frontend/src/reportWebVitals.js',
  
  // Temporary documentation
  'TEMP_README.md',
  'TODO.md',
  'NOTES.md'
];

// Function to safely remove file or directory
function safeRemove(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🗂️  Removed directory: ${filePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`📄 Removed file: ${filePath}`);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not remove ${filePath}: ${error.message}`);
  }
}

// Clean up files
console.log('🗑️  Removing unnecessary files...');
filesToRemove.forEach(safeRemove);

// Clean up node_modules if requested
if (process.argv.includes('--deep')) {
  console.log('\n🔄 Deep cleanup: Removing node_modules...');
  safeRemove('node_modules');
  safeRemove('frontend/node_modules');
  safeRemove('backend/node_modules');
  
  console.log('📦 Reinstalling dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm run install-all', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Dependencies reinstalled');
  } catch (error) {
    console.error('❌ Failed to reinstall dependencies:', error.message);
  }
}

// Check for unused imports (basic check)
console.log('\n🔍 Checking for potential issues...');

const jsFiles = [
  'frontend/src/App.js',
  'frontend/src/index.js',
  'frontend/src/pages/Landing.js',
  'frontend/src/pages/Dashboard.js',
  'frontend/src/pages/TextToImage.js',
  'frontend/src/pages/ImageToImage.js'
];

jsFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for console.log statements
    if (content.includes('console.log')) {
      console.warn(`⚠️  Found console.log in ${filePath}`);
    }
    
    // Check for TODO comments
    if (content.includes('TODO') || content.includes('FIXME')) {
      console.warn(`⚠️  Found TODO/FIXME in ${filePath}`);
    }
  }
});

// Optimize package.json files
console.log('\n📦 Optimizing package.json files...');

const packageFiles = [
  'package.json',
  'frontend/package.json',
  'backend/package.json'
];

packageFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      
      // Remove unnecessary fields for production
      delete packageData.devDependencies?.['@types/node'];
      delete packageData.devDependencies?.['@types/react'];
      delete packageData.devDependencies?.['@types/react-dom'];
      
      // Ensure scripts are optimized
      if (packageData.scripts) {
        // Remove test scripts in production build
        if (process.argv.includes('--production')) {
          delete packageData.scripts.test;
          delete packageData.scripts.eject;
        }
      }
      
      // Write back optimized package.json
      fs.writeFileSync(fullPath, JSON.stringify(packageData, null, 2));
      console.log(`✅ Optimized ${filePath}`);
    } catch (error) {
      console.warn(`⚠️  Could not optimize ${filePath}: ${error.message}`);
    }
  }
});

// Create production-ready .env.example
console.log('\n🔧 Creating production-ready .env.example...');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const productionEnvExample = `# Frontend Environment Variables
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Backend Environment Variables
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour_private_key\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Image Generation
REPLICATE_API_TOKEN=r8_your_replicate_token
HUGGINGFACE_API_KEY=hf_your_huggingface_token
POLLINATIONS_API_TOKEN=your_pollinations_token

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
`;

fs.writeFileSync(envExamplePath, productionEnvExample);
console.log('✅ Created production-ready .env.example');

console.log('\n📋 Cleanup Summary:');
console.log('✅ Removed unnecessary files');
console.log('✅ Optimized package.json files');
console.log('✅ Created production .env.example');
console.log('✅ Checked for potential issues');

console.log('\n🎉 Cleanup complete!');
console.log('💡 Your app is now cleaner and ready for deployment');

// Usage instructions
console.log('\n📖 Usage:');
console.log('- Basic cleanup: node scripts/cleanup.js');
console.log('- Deep cleanup: node scripts/cleanup.js --deep');
console.log('- Production prep: node scripts/cleanup.js --production');