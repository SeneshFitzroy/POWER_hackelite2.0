// Firebase v8 Conversion Script
const fs = require('fs');
const path = require('path');

// List of files that need to be converted
const filesToConvert = [
  'src/utils/clearFirebaseData.js',
  'src/utils/clearCustomerData.js',
  'src/services/transactionService.js',
  'src/services/supplierService.js',
  'src/services/realPharmacyDataService.js',
  'src/services/quarantineService.js',
  'src/services/purchaseOrderService.js',
  'src/services/prescriptionService.js',
  'src/services/patientService.js',
  'src/services/inventoryService.js',
  'src/services/dataInitService.js',
  'src/services/coldChainService.js',
  'src/services/medicineService.js',
  'src/pos/services/transactionService.js',
  'src/pos/services/prescriptionService.js',
  'src/pos/services/patientService.js',
  'src/pos/services/medicineService.js',
  'src/pos/services/employeeService.js',
  'src/pos/services/dataInitServiceNew.js',
  'src/pos/services/dataInitService.js',
  'src/pos/services/customerService.js',
  'src/pos/components/PharmacyPOSFirebaseIntegrated.js',
  'src/components/sales/SalesOrders.js',
  'src/components/sales/SalesDashboard.js',
  'src/components/sales/CustomerManagement.js',
  'src/components/hr/Payroll/PayrollList.js',
  'src/components/hr/License/LicenseTracking.js',
  'src/components/hr/Employee/EmployeeList.js',
  'src/components/hr/Dashboard/Dashboard.js',
  'src/components/hr/Attendance/AttendanceList.js',
  'src/components/finance/Finance.js'
];

// Firebase v9+ to v8 import replacements
const importReplacements = {
  // Remove all v9+ imports and add simple v8 imports
  'replace_v9_imports': {
    pattern: /import\s*\{[^}]*\}\s*from\s*['"]firebase\/firestore['"];?\s*\n/g,
    replacement: "import { db } from '../firebase/config';\nimport firebase from 'firebase/app';\n"
  }
};

// Firebase v9+ to v8 function call replacements
const functionReplacements = {
  // collection() -> db.collection()
  'collection_calls': {
    pattern: /collection\(db,\s*['"`]([^'"`]+)['"`]\)/g,
    replacement: "db.collection('$1')"
  },
  
  // query() -> collection.where().orderBy() etc
  'query_calls': {
    pattern: /query\(\s*collection\(db,\s*['"`]([^'"`]+)['"`]\)/g,
    replacement: "db.collection('$1')"
  },
  
  // getDocs() -> .get()
  'getDocs_calls': {
    pattern: /getDocs\(/g,
    replacement: '('
  },
  
  // getDoc() -> .get()
  'getDoc_calls': {
    pattern: /getDoc\(/g,
    replacement: '('
  },
  
  // addDoc() -> .add()
  'addDoc_calls': {
    pattern: /addDoc\(\s*collection\(db,\s*['"`]([^'"`]+)['"`]\),\s*/g,
    replacement: "db.collection('$1').add("
  },
  
  // updateDoc() -> .update()
  'updateDoc_calls': {
    pattern: /updateDoc\(\s*doc\(db,\s*['"`]([^'"`]+)['"`],\s*([^)]+)\),\s*/g,
    replacement: "db.collection('$1').doc($2).update("
  },
  
  // deleteDoc() -> .delete()
  'deleteDoc_calls': {
    pattern: /deleteDoc\(\s*doc\(db,\s*['"`]([^'"`]+)['"`],\s*([^)]+)\)\s*/g,
    replacement: "db.collection('$1').doc($2).delete()"
  },
  
  // serverTimestamp() -> firebase.firestore.FieldValue.serverTimestamp()
  'serverTimestamp_calls': {
    pattern: /serverTimestamp\(\)/g,
    replacement: 'firebase.firestore.FieldValue.serverTimestamp()'
  },
  
  // Timestamp -> firebase.firestore.Timestamp
  'Timestamp_calls': {
    pattern: /\bTimestamp\./g,
    replacement: 'firebase.firestore.Timestamp.'
  },
  
  // increment() -> firebase.firestore.FieldValue.increment()
  'increment_calls': {
    pattern: /increment\(/g,
    replacement: 'firebase.firestore.FieldValue.increment('
  },
  
  // writeBatch() -> db.batch()
  'writeBatch_calls': {
    pattern: /writeBatch\(db\)/g,
    replacement: 'db.batch()'
  }
};

console.log('Starting Firebase v8 conversion...');

filesToConvert.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Replace imports
    if (importReplacements.replace_v9_imports.pattern.test(content)) {
      content = content.replace(importReplacements.replace_v9_imports.pattern, importReplacements.replace_v9_imports.replacement);
      modified = true;
    }
    
    // Replace function calls
    Object.keys(functionReplacements).forEach(key => {
      const replacement = functionReplacements[key];
      if (replacement.pattern.test(content)) {
        content = content.replace(replacement.pattern, replacement.replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('Firebase v8 conversion completed!');
