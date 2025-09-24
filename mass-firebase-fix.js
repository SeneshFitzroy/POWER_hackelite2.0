// Mass Firebase v8 Fix Script
// This will be run manually to fix the most common patterns

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to process - focus on the most critical ones first
const serviceFiles = [
  'src/services/*.js',
  'src/pos/services/*.js',
  'src/utils/clearFirebaseData.js',
  'src/utils/clearCustomerData.js'
];

console.log('Starting mass Firebase v8 conversion...');

serviceFiles.forEach(pattern => {
  const files = glob.sync(pattern, { cwd: __dirname });
  
  files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // 1. Replace the import statements
      const oldImports = /import\s*\{[^}]*\}\s*from\s*['"]firebase\/firestore['"];?\s*/g;
      if (oldImports.test(content)) {
        content = content.replace(oldImports, "import { db } from '../firebase/config';\nimport firebase from 'firebase/app';\n");
        modified = true;
      }
      
      // 2. Basic replacements
      const replacements = [
        // serverTimestamp() -> firebase.firestore.FieldValue.serverTimestamp()
        [/serverTimestamp\(\)/g, 'firebase.firestore.FieldValue.serverTimestamp()'],
        
        // increment(n) -> firebase.firestore.FieldValue.increment(n)
        [/increment\(/g, 'firebase.firestore.FieldValue.increment('],
        
        // Timestamp -> firebase.firestore.Timestamp
        [/\bTimestamp\./g, 'firebase.firestore.Timestamp.'],
        
        // writeBatch(db) -> db.batch()
        [/writeBatch\(db\)/g, 'db.batch()'],
        
        // Simple collection references
        [/collection\(db,\s*['"`]([^'"`]+)['"`]\)/g, "db.collection('$1')"],
        
        // getDocs( -> get(
        [/getDocs\(/g, 'get('],
        
        // Simple addDoc patterns
        [/addDoc\(collection\(db,\s*['"`]([^'"`]+)['"`]\),/g, "db.collection('$1').add("],
      ];
      
      replacements.forEach(([pattern, replacement]) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated: ${file}`);
      } else {
        console.log(`ℹ️  No changes needed: ${file}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  });
});

console.log('Mass Firebase v8 conversion completed!');
