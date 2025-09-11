/**
 * Browser Console Script to Clear Customer Data
 * 
 * Instructions:
 * 1. Open your browser's Developer Tools (F12)
 * 2. Go to the Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter to execute
 * 
 * This will clear all customers, patients, and transactions from Firebase
 */

// Clear all customer data script for browser console
const clearAllDataFromConsole = async () => {
  try {
    console.log('🧹 STARTING COMPLETE DATA CLEANUP FROM CONSOLE...');
    
    // Import Firebase functions (assumes Firebase is already loaded in the app)
    const { db } = window; // Get db from global scope if available
    
    if (!db) {
      console.error('❌ Firebase database not found. Make sure you are on the ERP application page.');
      return;
    }
    
    const { collection, getDocs, deleteDoc, doc, writeBatch } = window.firebase?.firestore || window;
    
    if (!collection || !getDocs || !deleteDoc) {
      console.error('❌ Firebase Firestore functions not available. Make sure Firebase is loaded.');
      return;
    }
    
    let totalDeleted = 0;
    
    // Function to delete a collection
    const deleteCollection = async (collectionName) => {
      console.log(`📋 Clearing ${collectionName} collection...`);
      const snapshot = await getDocs(collection(db, collectionName));
      console.log(`Found ${snapshot.size} ${collectionName} records`);
      
      const deletePromises = snapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, collectionName, docSnapshot.id))
      );
      
      await Promise.all(deletePromises);
      totalDeleted += snapshot.size;
      
      console.log(`✅ Deleted ${snapshot.size} ${collectionName} records`);
      return snapshot.size;
    };
    
    // Clear collections
    const customersDeleted = await deleteCollection('customers');
    const patientsDeleted = await deleteCollection('patients');
    const transactionsDeleted = await deleteCollection('transactions');
    
    console.log('🎉 CLEANUP COMPLETE!');
    console.log('📊 SUMMARY:');
    console.log(`   - Customers deleted: ${customersDeleted}`);
    console.log(`   - Patients deleted: ${patientsDeleted}`);
    console.log(`   - Transactions deleted: ${transactionsDeleted}`);
    console.log(`   - Total records deleted: ${totalDeleted}`);
    
    alert(`✅ DATA CLEANUP COMPLETE!\n\nSummary:\n• Customers: ${customersDeleted}\n• Patients: ${patientsDeleted}\n• Transactions: ${transactionsDeleted}\n• Total: ${totalDeleted}`);
    
    // Refresh the page to update the UI
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    alert(`❌ Cleanup failed: ${error.message}`);
  }
};

// Execute the cleanup
console.log('🚨 WARNING: This will delete ALL customer and transaction data!');
console.log('Type "clearAllDataFromConsole()" and press Enter to execute the cleanup.');

// For immediate execution, uncomment the next line:
// clearAllDataFromConsole();
