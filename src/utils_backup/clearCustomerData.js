import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';

/**
 * Clear All Customer and Patient Data Utility
 * This utility safely removes all customers and patients from the database
 * Use with caution - this action cannot be undone!
 */

export const clearAllCustomerData = async () => {
  try {
    console.log('🗑️ STARTING CUSTOMER DATA CLEANUP...');
    
    const batch = writeBatch(db);
    let totalDeleted = 0;
    
    // 1. Clear Customers Collection
    console.log('📋 Fetching all customers...');
    const customersSnapshot = await getDocs(collection(db, 'customers'));
    console.log(`Found ${customersSnapshot.size} customers to delete`);
    
    customersSnapshot.docs.forEach((customerDoc) => {
      batch.delete(doc(db, 'customers', customerDoc.id));
      totalDeleted++;
    });
    
    // 2. Clear Patients Collection
    console.log('📋 Fetching all patients...');
    const patientsSnapshot = await getDocs(collection(db, 'patients'));
    console.log(`Found ${patientsSnapshot.size} patients to delete`);
    
    patientsSnapshot.docs.forEach((patientDoc) => {
      batch.delete(doc(db, 'patients', patientDoc.id));
      totalDeleted++;
    });
    
    // 3. Execute batch delete
    console.log(`🔥 Deleting ${totalDeleted} records...`);
    await batch.commit();
    
    console.log('✅ CLEANUP COMPLETE!');
    console.log(`📊 Summary:`);
    console.log(`   - Customers deleted: ${customersSnapshot.size}`);
    console.log(`   - Patients deleted: ${patientsSnapshot.size}`);
    console.log(`   - Total records deleted: ${totalDeleted}`);
    
    return {
      success: true,
      customersDeleted: customersSnapshot.size,
      patientsDeleted: patientsSnapshot.size,
      totalDeleted: totalDeleted
    };
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw new Error(`Cleanup failed: ${error.message}`);
  }
};

export const clearTransactionHistory = async () => {
  try {
    console.log('🗑️ CLEARING TRANSACTION HISTORY...');
    
    const batch = writeBatch(db);
    let transactionsDeleted = 0;
    
    // Clear Transactions Collection
    console.log('📋 Fetching all transactions...');
    const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
    console.log(`Found ${transactionsSnapshot.size} transactions to delete`);
    
    transactionsSnapshot.docs.forEach((transactionDoc) => {
      batch.delete(doc(db, 'transactions', transactionDoc.id));
      transactionsDeleted++;
    });
    
    // Execute batch delete
    console.log(`🔥 Deleting ${transactionsDeleted} transactions...`);
    await batch.commit();
    
    console.log('✅ TRANSACTION CLEANUP COMPLETE!');
    console.log(`📊 Transactions deleted: ${transactionsDeleted}`);
    
    return {
      success: true,
      transactionsDeleted: transactionsDeleted
    };
    
  } catch (error) {
    console.error('❌ Error during transaction cleanup:', error);
    throw new Error(`Transaction cleanup failed: ${error.message}`);
  }
};

export const clearAllTestData = async () => {
  try {
    console.log('🧹 COMPLETE DATA CLEANUP - REMOVING ALL TEST DATA...');
    
    // Clear customers and patients
    const customerResult = await clearAllCustomerData();
    
    // Clear transaction history
    const transactionResult = await clearTransactionHistory();
    
    console.log('🎉 COMPLETE CLEANUP FINISHED!');
    console.log('📊 FINAL SUMMARY:');
    console.log(`   - Customers deleted: ${customerResult.customersDeleted}`);
    console.log(`   - Patients deleted: ${customerResult.patientsDeleted}`);
    console.log(`   - Transactions deleted: ${transactionResult.transactionsDeleted}`);
    console.log(`   - Total records deleted: ${customerResult.totalDeleted + transactionResult.transactionsDeleted}`);
    
    return {
      success: true,
      summary: {
        customersDeleted: customerResult.customersDeleted,
        patientsDeleted: customerResult.patientsDeleted,
        transactionsDeleted: transactionResult.transactionsDeleted,
        totalDeleted: customerResult.totalDeleted + transactionResult.transactionsDeleted
      }
    };
    
  } catch (error) {
    console.error('❌ Complete cleanup failed:', error);
    throw new Error(`Complete cleanup failed: ${error.message}`);
  }
};
