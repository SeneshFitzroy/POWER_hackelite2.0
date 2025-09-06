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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';

// Patient Service
export const patientService = {
  // Add new patient
  addPatient: async (patientData) => {
    try {
      const docRef = await addDoc(collection(db, 'patients'), {
        ...patientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalPurchases: 0,
        lastVisit: serverTimestamp()
      });
      return { id: docRef.id, ...patientData };
    } catch (error) {
      throw new Error(`Error adding patient: ${error.message}`);
    }
  },

  // Find patient by phone number
  findPatientByPhone: async (phoneNumber) => {
    try {
      const q = query(
        collection(db, 'patients'),
        where('phoneNumber', '==', phoneNumber),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const patientDoc = querySnapshot.docs[0];
      return {
        id: patientDoc.id,
        ...patientDoc.data()
      };
    } catch (error) {
      throw new Error(`Error finding patient: ${error.message}`);
    }
  },

  // Find patient by NIC
  findPatientByNIC: async (nic) => {
    try {
      const q = query(
        collection(db, 'patients'),
        where('nic', '==', nic),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const patientDoc = querySnapshot.docs[0];
      return {
        id: patientDoc.id,
        ...patientDoc.data()
      };
    } catch (error) {
      throw new Error(`Error finding patient by NIC: ${error.message}`);
    }
  },

  // Get all patients
  getAllPatients: async () => {
    try {
      const q = query(collection(db, 'patients'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching patients: ${error.message}`);
    }
  },

  // Get patient purchase history
  getPatientHistory: async (patientId) => {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching patient history: ${error.message}`);
    }
  },

  // Update patient information
  updatePatient: async (patientId, updateData) => {
    try {
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
        lastVisit: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(`Error updating patient: ${error.message}`);
    }
  },

  // Get patient prescriptions
  getPatientPrescriptions: async (patientId) => {
    try {
      const q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching prescriptions: ${error.message}`);
    }
  },

  // Search patients
  searchPatients: async (searchTerm) => {
    try {
      const queries = [
        // Search by name
        query(
          collection(db, 'patients'),
          where('name', '>=', searchTerm.toLowerCase()),
          where('name', '<=', searchTerm.toLowerCase() + '\uf8ff'),
          limit(10)
        ),
        // Search by phone
        query(
          collection(db, 'patients'),
          where('phoneNumber', '>=', searchTerm),
          where('phoneNumber', '<=', searchTerm + '\uf8ff'),
          limit(10)
        )
      ];

      const results = [];
      for (const q of queries) {
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
          results.push({ id: doc.id, ...doc.data() });
        });
      }

      // Remove duplicates
      const uniqueResults = results.filter((patient, index, self) => 
        index === self.findIndex(p => p.id === patient.id)
      );

      return uniqueResults;
    } catch (error) {
      throw new Error(`Error searching patients: ${error.message}`);
    }
  }
};
