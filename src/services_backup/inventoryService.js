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
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Inventory Service
export const inventoryService = {
  // Get all medicines with real-time updates
  getAllMedicines: async () => {
    try {
      const q = query(collection(db, 'medicines'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching medicines: ${error.message}`);
    }
  },

  // Get medicine by ID
  getMedicineById: async (medicineId) => {
    try {
      const docRef = doc(db, 'medicines', medicineId);
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
      throw new Error(`Error fetching medicine: ${error.message}`);
    }
  },

  // Update medicine stock
  updateStock: async (medicineId, quantityChange, reason = 'Manual adjustment') => {
    try {
      const medicineRef = doc(db, 'medicines', medicineId);
      await updateDoc(medicineRef, {
        stockQuantity: increment(quantityChange),
        updatedAt: serverTimestamp()
      });
      
      // Log the stock change
      await addDoc(collection(db, 'stock_transactions'), {
        medicineId,
        quantityChange,
        reason,
        timestamp: serverTimestamp(),
        type: quantityChange > 0 ? 'in' : 'out'
      });
      
      return true;
    } catch (error) {
      throw new Error(`Error updating stock: ${error.message}`);
    }
  },

  // Update medicine information
  updateMedicine: async (medicineId, updateData) => {
    try {
      const medicineRef = doc(db, 'medicines', medicineId);
      await updateDoc(medicineRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(`Error updating medicine: ${error.message}`);
    }
  },

  // Get low stock medicines
  getLowStockMedicines: async (threshold = 10) => {
    try {
      const q = query(
        collection(db, 'medicines'),
        where('stockQuantity', '<=', threshold),
        orderBy('stockQuantity')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching low stock medicines: ${error.message}`);
    }
  },

  // Get expiring medicines
  getExpiringMedicines: async (daysFromNow = 30) => {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysFromNow);
      
      const q = query(
        collection(db, 'medicines'),
        where('expiryDate', '<=', futureDate),
        orderBy('expiryDate')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching expiring medicines: ${error.message}`);
    }
  },

  // Get medicines by status
  getMedicinesByStatus: async (status) => {
    try {
      const q = query(
        collection(db, 'medicines'),
        where('status', '==', status),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching medicines by status: ${error.message}`);
    }
  },

  // Search medicines
  searchMedicines: async (searchTerm) => {
    try {
      const q = query(collection(db, 'medicines'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const allMedicines = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter medicines based on search term (case-insensitive)
      const searchLower = searchTerm.toLowerCase();
      const filteredMedicines = allMedicines.filter(medicine => {
        return (
          medicine.name?.toLowerCase().includes(searchLower) ||
          medicine.genericName?.toLowerCase().includes(searchLower) ||
          medicine.manufacturer?.toLowerCase().includes(searchLower) ||
          medicine.category?.toLowerCase().includes(searchLower) ||
          medicine.batchNumber?.toLowerCase().includes(searchLower) ||
          medicine.rackLocation?.toLowerCase().includes(searchLower) ||
          medicine.barcode === searchTerm
        );
      });

      return filteredMedicines;
    } catch (error) {
      throw new Error(`Error searching medicines: ${error.message}`);
    }
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    try {
      const medicines = await inventoryService.getAllMedicines();
      
      const stats = {
        totalMedicines: medicines.length,
        activeMedicines: medicines.filter(m => m.status === 'active').length,
        lowStockMedicines: medicines.filter(m => (m.stockQuantity || 0) <= (m.minStockLevel || 10)).length,
        expiringMedicines: medicines.filter(m => {
          if (!m.expiryDate) return false;
          const daysUntilExpiry = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        }).length,
        expiredMedicines: medicines.filter(m => {
          if (!m.expiryDate) return false;
          return new Date(m.expiryDate) < new Date();
        }).length,
        totalStockValue: medicines.reduce((total, medicine) => {
          const quantity = medicine.stockQuantity || 0;
          const costPrice = medicine.costPrice || 0;
          return total + (quantity * costPrice);
        }, 0)
      };

      return stats;
    } catch (error) {
      throw new Error(`Error fetching inventory stats: ${error.message}`);
    }
  },

  // Listen to medicine changes in real-time
  subscribeMedicines: (callback) => {
    const q = query(collection(db, 'medicines'), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      const medicines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(medicines);
    });
  },

  // Listen to low stock medicines
  subscribeLowStockMedicines: (threshold, callback) => {
    const q = query(
      collection(db, 'medicines'),
      where('stockQuantity', '<=', threshold),
      orderBy('stockQuantity')
    );
    return onSnapshot(q, (snapshot) => {
      const medicines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(medicines);
    });
  },

  // Listen to expiring medicines
  subscribeExpiringMedicines: (daysFromNow, callback) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);
    
    const q = query(
      collection(db, 'medicines'),
      where('expiryDate', '<=', futureDate),
      orderBy('expiryDate')
    );
    return onSnapshot(q, (snapshot) => {
      const medicines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(medicines);
    });
  },

  // Delete medicine
  deleteMedicine: async (medicineId) => {
    try {
      await deleteDoc(doc(db, 'medicines', medicineId));
      return { success: true, message: 'Medicine deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting medicine: ${error.message}`);
    }
  }
};

