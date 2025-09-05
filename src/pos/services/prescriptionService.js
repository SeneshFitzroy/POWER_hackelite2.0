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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';

// Prescription Service
export const prescriptionService = {
  // Add new prescription
  addPrescription: async (prescriptionData) => {
    try {
      const docRef = await addDoc(collection(db, 'prescriptions'), {
        ...prescriptionData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...prescriptionData };
    } catch (error) {
      throw new Error(`Error adding prescription: ${error.message}`);
    }
  },

  // Get prescription by ID
  getPrescription: async (prescriptionId) => {
    try {
      const docRef = doc(db, 'prescriptions', prescriptionId);
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
      throw new Error(`Error fetching prescription: ${error.message}`);
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
      throw new Error(`Error fetching patient prescriptions: ${error.message}`);
    }
  },

  // Update prescription status
  updatePrescriptionStatus: async (prescriptionId, status, filledBy = null) => {
    try {
      const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
      const updateData = {
        status,
        updatedAt: serverTimestamp()
      };
      
      if (status === 'filled' && filledBy) {
        updateData.filledBy = filledBy;
        updateData.filledAt = serverTimestamp();
      }
      
      await updateDoc(prescriptionRef, updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating prescription: ${error.message}`);
    }
  },

  // Get pending prescriptions
  getPendingPrescriptions: async () => {
    try {
      const q = query(
        collection(db, 'prescriptions'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching pending prescriptions: ${error.message}`);
    }
  },

  // Search prescriptions
  searchPrescriptions: async (searchTerm) => {
    try {
      // Search by prescription number or patient phone
      const queries = [
        query(
          collection(db, 'prescriptions'),
          where('prescriptionNumber', '>=', searchTerm),
          where('prescriptionNumber', '<=', searchTerm + '\uf8ff'),
          limit(10)
        ),
        query(
          collection(db, 'prescriptions'),
          where('patientPhone', '>=', searchTerm),
          where('patientPhone', '<=', searchTerm + '\uf8ff'),
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
      const uniqueResults = results.filter((prescription, index, self) => 
        index === self.findIndex(p => p.id === prescription.id)
      );

      return uniqueResults;
    } catch (error) {
      throw new Error(`Error searching prescriptions: ${error.message}`);
    }
  },

  // Check drug interactions
  checkDrugInteractions: async (medicineIds) => {
    try {
      // Get all medicines and their interaction data
      const interactions = [];
      
      for (let i = 0; i < medicineIds.length; i++) {
        for (let j = i + 1; j < medicineIds.length; j++) {
          const med1Ref = doc(db, 'medicines', medicineIds[i]);
          const med2Ref = doc(db, 'medicines', medicineIds[j]);
          
          const [med1Snap, med2Snap] = await Promise.all([
            getDoc(med1Ref),
            getDoc(med2Ref)
          ]);
          
          if (med1Snap.exists() && med2Snap.exists()) {
            const med1Data = med1Snap.data();
            const med2Data = med2Snap.data();
            
            // Check for interactions (simplified logic)
            if (med1Data.interactions && med2Data.activeIngredient) {
              const hasInteraction = med1Data.interactions.some(interaction => 
                interaction.ingredient === med2Data.activeIngredient
              );
              
              if (hasInteraction) {
                interactions.push({
                  medicine1: med1Data.name,
                  medicine2: med2Data.name,
                  severity: 'moderate', // This would come from interaction data
                  description: 'Potential drug interaction detected'
                });
              }
            }
          }
        }
      }
      
      return interactions;
    } catch (error) {
      throw new Error(`Error checking interactions: ${error.message}`);
    }
  }
};
