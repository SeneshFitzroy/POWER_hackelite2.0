import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Clear all data from Firebase collections
 * WARNING: This will permanently delete all data!
 */
export const clearAllFirebaseData = async () => {
  try {
    console.log('🗑️ Starting Firebase data cleanup...');
    
    const collections = [
      'employees', 
      'licenses', 
      'payrolls', 
      'performance_reviews',
      'attendance',
      'medicines',
      'patients',
      'transactions',
      'prescriptions'
    ];
    
    let totalDeleted = 0;
    
    for (const collectionName of collections) {
      try {
        console.log(`🧹 Clearing ${collectionName} collection...`);
        
        const querySnapshot = await getDocs(collection(db, collectionName));
        const deletePromises = [];
        
        querySnapshot.forEach((document) => {
          deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
        });
        
        await Promise.all(deletePromises);
        
        console.log(`✅ Deleted ${deletePromises.length} documents from ${collectionName}`);
        totalDeleted += deletePromises.length;
        
      } catch (error) {
        console.log(`ℹ️ Collection ${collectionName} doesn't exist or is empty`);
      }
    }
    
    console.log(`🎉 Firebase cleanup complete! Deleted ${totalDeleted} total documents`);
    
    return {
      success: true,
      message: `Successfully deleted ${totalDeleted} documents from Firebase`,
      deletedCount: totalDeleted
    };
    
  } catch (error) {
    console.error('❌ Error clearing Firebase data:', error);
    return {
      success: false,
      message: 'Failed to clear Firebase data: ' + error.message,
      error: error
    };
  }
};

/**
 * Clear specific collection
 */
export const clearCollection = async (collectionName) => {
  try {
    console.log(`🧹 Clearing ${collectionName} collection...`);
    
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = [];
    
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${deletePromises.length} documents from ${collectionName}`);
    
    return {
      success: true,
      message: `Deleted ${deletePromises.length} documents from ${collectionName}`,
      deletedCount: deletePromises.length
    };
    
  } catch (error) {
    console.error(`❌ Error clearing ${collectionName}:`, error);
    return {
      success: false,
      message: `Failed to clear ${collectionName}: ${error.message}`,
      error: error
    };
  }
};
