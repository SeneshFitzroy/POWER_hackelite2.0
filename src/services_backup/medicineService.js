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

// Medicine Service
export const medicineService = {
  // Add new medicine to inventory
  addMedicine: async (medicineData) => {
    try {
      const docRef = await addDoc(collection(db, 'medicines'), {
        ...medicineData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...medicineData };
    } catch (error) {
      throw new Error(`Error adding medicine: ${error.message}`);
    }
  },

  // Get all medicines
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

  // Search medicines by name or barcode
  searchMedicines: async (searchTerm) => {
    try {
      const q = query(
        collection(db, 'medicines'),
        where('name', '>=', searchTerm.toLowerCase()),
        where('name', '<=', searchTerm.toLowerCase() + '\uf8ff'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const nameResults = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Also search by barcode
      const barcodeQuery = query(
        collection(db, 'medicines'),
        where('barcode', '==', searchTerm)
      );
      const barcodeSnapshot = await getDocs(barcodeQuery);
      const barcodeResults = barcodeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Combine and deduplicate results
      const allResults = [...nameResults, ...barcodeResults];
      const uniqueResults = allResults.filter((medicine, index, self) => 
        index === self.findIndex(m => m.id === medicine.id)
      );

      return uniqueResults;
    } catch (error) {
      throw new Error(`Error searching medicines: ${error.message}`);
    }
  },

  // Update medicine stock
  updateStock: async (medicineId, quantityChange) => {
    try {
      const medicineRef = doc(db, 'medicines', medicineId);
      await updateDoc(medicineRef, {
        stockQuantity: increment(quantityChange),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(`Error updating stock: ${error.message}`);
    }
  },

  // Get medicines with low stock
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

  // Get medicines expiring soon
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
  }
};
