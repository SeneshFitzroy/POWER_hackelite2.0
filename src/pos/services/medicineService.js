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
import { db } from '../../firebase/config';

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
      // Get all medicines first, then filter client-side for better search
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
          medicine.activeIngredient?.toLowerCase().includes(searchLower) ||
          medicine.barcode === searchTerm
        );
      });

      // Sort by relevance (exact name matches first)
      filteredMedicines.sort((a, b) => {
        const aNameMatch = a.name?.toLowerCase().startsWith(searchLower);
        const bNameMatch = b.name?.toLowerCase().startsWith(searchLower);
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return a.name?.localeCompare(b.name) || 0;
      });

      return filteredMedicines.slice(0, 20); // Limit to 20 results
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
