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

      // 3. Update patient purchase history if patient exists
      if (saleData.patientId) {
        const patientRef = doc(db, 'patients', saleData.patientId);
        batch.update(patientRef, {
          totalPurchases: increment(saleData.totalAmount),
          lastVisit: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // 4. Update daily sales summary
      const today = new Date().toISOString().split('T')[0];
      const dailySalesRef = doc(db, 'dailySales', today);
      batch.set(dailySalesRef, {
        date: today,
        totalSales: increment(saleData.totalAmount),
        transactionCount: increment(1),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Execute all operations
      await batch.commit();
      
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
