import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Quarantine Service
export const quarantineService = {
  // Quarantine a medicine
  quarantineMedicine: async (medicineId, reason, actionTaken = 'quarantined') => {
    try {
      // Update medicine status to quarantined
      const medicineRef = doc(db, 'medicines', medicineId);
      await updateDoc(medicineRef, {
        status: 'quarantined',
        updatedAt: serverTimestamp()
      });

      // Create quarantine log entry
      const logData = {
        medicineId,
        reason,
        actionTaken,
        status: 'quarantined',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const logRef = await addDoc(collection(db, 'quarantineLogs'), logData);
      
      return { 
        success: true, 
        logId: logRef.id,
        message: 'Medicine quarantined successfully' 
      };
    } catch (error) {
      throw new Error(`Error quarantining medicine: ${error.message}`);
    }
  },

  // Release medicine from quarantine
  releaseFromQuarantine: async (medicineId, reason, actionTaken = 'released') => {
    try {
      // Update medicine status to active
      const medicineRef = doc(db, 'medicines', medicineId);
      await updateDoc(medicineRef, {
        status: 'active',
        updatedAt: serverTimestamp()
      });

      // Create quarantine log entry for release
      const logData = {
        medicineId,
        reason,
        actionTaken,
        status: 'released',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const logRef = await addDoc(collection(db, 'quarantineLogs'), logData);
      
      return { 
        success: true, 
        logId: logRef.id,
        message: 'Medicine released from quarantine successfully' 
      };
    } catch (error) {
      throw new Error(`Error releasing medicine from quarantine: ${error.message}`);
    }
  },

  // Mark medicine as expired
  markAsExpired: async (medicineId, reason, actionTaken = 'expired') => {
    try {
      // Update medicine status to expired
      const medicineRef = doc(db, 'medicines', medicineId);
      await updateDoc(medicineRef, {
        status: 'expired',
        updatedAt: serverTimestamp()
      });

      // Create quarantine log entry
      const logData = {
        medicineId,
        reason,
        actionTaken,
        status: 'expired',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const logRef = await addDoc(collection(db, 'quarantineLogs'), logData);
      
      return { 
        success: true, 
        logId: logRef.id,
        message: 'Medicine marked as expired successfully' 
      };
    } catch (error) {
      throw new Error(`Error marking medicine as expired: ${error.message}`);
    }
  },

  // Get all quarantined medicines
  getQuarantinedMedicines: async () => {
    try {
      const q = query(
        collection(db, 'medicines'),
        where('status', '==', 'quarantined')
      );
      const querySnapshot = await getDocs(q);
      const medicines = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by updatedAt in JavaScript to avoid composite index requirement
      return medicines.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
        const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
        return bTime - aTime; // Descending order
      });
    } catch (error) {
      throw new Error(`Error fetching quarantined medicines: ${error.message}`);
    }
  },

  // Get all expired medicines
  getExpiredMedicines: async () => {
    try {
      const q = query(
        collection(db, 'medicines'),
        where('status', '==', 'expired')
      );
      const querySnapshot = await getDocs(q);
      const medicines = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by updatedAt in JavaScript to avoid composite index requirement
      return medicines.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
        const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
        return bTime - aTime; // Descending order
      });
    } catch (error) {
      throw new Error(`Error fetching expired medicines: ${error.message}`);
    }
  },

  // Get quarantine logs for a specific medicine
  getQuarantineLogs: async (medicineId) => {
    try {
      const q = query(
        collection(db, 'quarantineLogs'),
        where('medicineId', '==', medicineId)
      );
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript to avoid composite index requirement
      return logs.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
    } catch (error) {
      throw new Error(`Error fetching quarantine logs: ${error.message}`);
    }
  },

  // Get all quarantine logs
  getAllQuarantineLogs: async () => {
    try {
      const q = query(collection(db, 'quarantineLogs'));
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript to avoid composite index requirement
      return logs.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
    } catch (error) {
      throw new Error(`Error fetching quarantine logs: ${error.message}`);
    }
  },

  // Get quarantine statistics
  getQuarantineStats: async () => {
    try {
      const [quarantined, expired, logs] = await Promise.all([
        quarantineService.getQuarantinedMedicines(),
        quarantineService.getExpiredMedicines(),
        quarantineService.getAllQuarantineLogs()
      ]);

      return {
        quarantinedCount: quarantined.length,
        expiredCount: expired.length,
        totalLogs: logs.length,
        recentQuarantines: logs.filter(log => 
          log.actionTaken === 'quarantined' && 
          new Date(log.createdAt?.toDate?.() || log.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      };
    } catch (error) {
      throw new Error(`Error fetching quarantine statistics: ${error.message}`);
    }
  },

  // Listen to quarantined medicines changes in real-time
  subscribeQuarantinedMedicines: (callback) => {
    const q = query(
      collection(db, 'medicines'),
      where('status', '==', 'quarantined')
    );
    return onSnapshot(q, (snapshot) => {
      const medicines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by updatedAt in JavaScript to avoid composite index requirement
      const sortedMedicines = medicines.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
        const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
        return bTime - aTime; // Descending order
      });
      
      callback(sortedMedicines);
    });
  },

  // Listen to expired medicines changes in real-time
  subscribeExpiredMedicines: (callback) => {
    const q = query(
      collection(db, 'medicines'),
      where('status', '==', 'expired')
    );
    return onSnapshot(q, (snapshot) => {
      const medicines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by updatedAt in JavaScript to avoid composite index requirement
      const sortedMedicines = medicines.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
        const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
        return bTime - aTime; // Descending order
      });
      
      callback(sortedMedicines);
    });
  },

  // Listen to quarantine logs changes in real-time
  subscribeQuarantineLogs: (callback) => {
    const q = query(collection(db, 'quarantineLogs'));
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript to avoid composite index requirement
      const sortedLogs = logs.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
      
      callback(sortedLogs);
    });
  },

  // Bulk quarantine medicines
  bulkQuarantine: async (medicineIds, reason, actionTaken = 'quarantined') => {
    try {
      const batch = writeBatch(db);
      const logPromises = [];

      for (const medicineId of medicineIds) {
        // Update medicine status
        const medicineRef = doc(db, 'medicines', medicineId);
        batch.update(medicineRef, {
          status: 'quarantined',
          updatedAt: serverTimestamp()
        });

        // Create log entry
        const logData = {
          medicineId,
          reason,
          actionTaken,
          status: 'quarantined',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        logPromises.push(addDoc(collection(db, 'quarantineLogs'), logData));
      }

      await batch.commit();
      await Promise.all(logPromises);

      return { 
        success: true, 
        message: `${medicineIds.length} medicines quarantined successfully` 
      };
    } catch (error) {
      throw new Error(`Error bulk quarantining medicines: ${error.message}`);
    }
  }
};
