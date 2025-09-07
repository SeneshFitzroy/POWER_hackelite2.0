#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 HR Module Firebase Setup Script');
console.log('==================================\n');

// Check if .env file exists in HR/backend
const backendEnvPath = path.join(process.cwd(), 'HR', 'backend', '.env');
const frontendEnvPath = path.join(process.cwd(), 'HR', 'frontend', '.env');

if (!fs.existsSync(backendEnvPath)) {
  console.log('📝 Creating HR backend .env file...');
  
  const backendEnvContent = `# HR Backend Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour_private_key_here\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project_id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/

# Server Configuration
PORT=5000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ HR backend .env file created');
} else {
  console.log('✅ HR backend .env file already exists');
}

if (!fs.existsSync(frontendEnvPath)) {
  console.log('📝 Creating HR frontend .env file...');
  
  const frontendEnvContent = `# HR Frontend Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
`;

  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ HR frontend .env file created');
} else {
  console.log('✅ HR frontend .env file already exists');
}

console.log('\n📋 Next Steps for HR Module:');
console.log('============================');
console.log('1. Update HR/backend/.env with your Firebase service account credentials');
console.log('2. Update HR/frontend/.env with your Firebase web app configuration');
console.log('3. Install dependencies:');
console.log('   cd HR/backend && npm install');
console.log('   cd HR/frontend && npm install');
console.log('4. Start the HR backend: cd HR/backend && npm start');
console.log('5. Start the HR frontend: cd HR/frontend && npm start');

console.log('\n🔧 Available Commands:');
console.log('======================');
console.log('cd HR/backend && npm start   - Start HR backend server');
console.log('cd HR/frontend && npm start  - Start HR frontend application');

console.log('\n✨ HR Module setup script completed!');

