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
import { db } from '../firebase/config';

// Employee Service
export const employeeService = {
  // Verify employee by ID
  verifyEmployee: async (employeeId) => {
    try {
      const q = query(
        collection(db, 'employees'),
        where('employeeId', '==', employeeId),
        where('status', '==', 'active'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const employeeDoc = querySnapshot.docs[0];
      return {
        id: employeeDoc.id,
        ...employeeDoc.data()
      };
    } catch (error) {
      throw new Error(`Error verifying employee: ${error.message}`);
    }
  },

  // Verify pharmacy registration number
  verifyPharmacyRegistration: async (registrationNumber) => {
    try {
      const q = query(
        collection(db, 'pharmacyRegistrations'),
        where('registrationNumber', '==', registrationNumber),
        where('status', '==', 'active'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const regDoc = querySnapshot.docs[0];
      return {
        id: regDoc.id,
        ...regDoc.data()
      };
    } catch (error) {
      throw new Error(`Error verifying registration: ${error.message}`);
    }
  },

  // Add new employee
  addEmployee: async (employeeData) => {
    try {
      const docRef = await addDoc(collection(db, 'employees'), {
        ...employeeData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...employeeData };
    } catch (error) {
      throw new Error(`Error adding employee: ${error.message}`);
    }
  },

  // Get all employees
  getAllEmployees: async () => {
    try {
      const q = query(
        collection(db, 'employees'),
        where('status', '==', 'active'),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching employees: ${error.message}`);
    }
  },

  // Update employee
  updateEmployee: async (employeeId, updateData) => {
    try {
      const employeeRef = doc(db, 'employees', employeeId);
      await updateDoc(employeeRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(`Error updating employee: ${error.message}`);
    }
  },

  // Log employee activity
  logEmployeeActivity: async (employeeId, activity) => {
    try {
      await addDoc(collection(db, 'employeeActivities'), {
        employeeId,
        activity,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(`Error logging activity: ${error.message}`);
    }
  },

  // Get employee activity log
  getEmployeeActivity: async (employeeId, limitCount = 50) => {
    try {
      const q = query(
        collection(db, 'employeeActivities'),
        where('employeeId', '==', employeeId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching activity: ${error.message}`);
    }
  }
};
