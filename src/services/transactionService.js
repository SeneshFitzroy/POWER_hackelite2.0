import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Transaction Service
export const transactionService = {
  // Process sale transaction
  processSale: async (saleData) => {
    console.log('Processing transaction for:', saleData.customerName || 'Walk-in Customer');
    console.log('Transaction total:', saleData.total);
    
    const batch = writeBatch(db);
    
    try {
      // 1. Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      const transactionData = {
        ...saleData,
        transactionId: transactionRef.id,
        status: 'completed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      batch.set(transactionRef, transactionData);

      // 2. Update medicine stock quantities
      for (const item of saleData.items) {
        const medicineRef = doc(db, 'medicines', item.medicineId);
        batch.update(medicineRef, {
          stockQuantity: increment(-item.quantity),
          updatedAt: serverTimestamp()
        });
      }

      // 3. Update patient purchase history only if patient document exists
      if (saleData.patientId && saleData.patientId.trim()) {
        try {
          const patientRef = doc(db, 'patients', saleData.patientId);
          const patientDoc = await getDoc(patientRef);
          
          if (patientDoc.exists()) {
            batch.update(patientRef, {
              totalPurchases: increment(saleData.total || saleData.totalAmount || 0),
              lastVisit: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            console.log('Updated patient purchase history for:', saleData.patientId);
          } else {
            console.warn('Patient document does not exist for ID:', saleData.patientId);
          }
        } catch (patientError) {
          console.error('Error updating patient document:', patientError);
          // Continue processing the sale even if patient update fails
        }
      }

      // 4. Update daily sales summary
      const today = new Date().toISOString().split('T')[0];
      const dailySalesRef = doc(db, 'dailySales', today);
      batch.set(dailySalesRef, {
        date: today,
        totalSales: increment(saleData.total || saleData.totalAmount || 0),
        transactionCount: increment(1),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Execute all operations
      await batch.commit();
      
      console.log('Transaction batch committed successfully');
      console.log('Returning transaction:', {
        id: transactionRef.id,
        ...transactionData
      });
      
      return {
        id: transactionRef.id,
        ...transactionData
      };
    } catch (error) {
      throw new Error(`Error processing sale: ${error.message}`);
    }
  },

  // Get transaction by ID
  getTransaction: async (transactionId) => {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error fetching transaction: ${error.message}`);
    }
  },

  // Get recent transactions
  getRecentTransactions: async (limitCount = 50) => {
    try {
      const q = query(
        collection(db, 'transactions'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (startDate, endDate) => {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching transactions by date: ${error.message}`);
    }
  },

  // Process refund
  processRefund: async (originalTransactionId, refundData) => {
    const batch = writeBatch(db);
    
    try {
      // 1. Create refund transaction
      const refundRef = doc(collection(db, 'transactions'));
      const refundTransaction = {
        ...refundData,
        transactionId: refundRef.id,
        originalTransactionId,
        type: 'refund',
        status: 'completed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      batch.set(refundRef, refundTransaction);

      // 2. Update medicine stock (add back)
      for (const item of refundData.items) {
        const medicineRef = doc(db, 'medicines', item.medicineId);
        batch.update(medicineRef, {
          stockQuantity: increment(item.quantity),
          updatedAt: serverTimestamp()
        });
      }

      // 3. Update original transaction status
      const originalRef = doc(db, 'transactions', originalTransactionId);
      batch.update(originalRef, {
        status: 'refunded',
        refundTransactionId: refundRef.id,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      
      return {
        id: refundRef.id,
        ...refundTransaction
      };
    } catch (error) {
      throw new Error(`Error processing refund: ${error.message}`);
    }
  },

  // Get daily sales report
  getDailySalesReport: async (date) => {
    try {
      const dateStr = date || new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'dailySales', dateStr);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return {
          date: dateStr,
          totalSales: 0,
          transactionCount: 0
        };
      }
    } catch (error) {
      throw new Error(`Error fetching daily sales: ${error.message}`);
    }
  },

  // Listen to real-time transactions
  subscribeTransactions: (callback, limitCount = 20) => {
    const q = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(transactions);
    });
  }
};
