import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export const addCustomer = async (customerData) => {
  try {
    const docRef = await addDoc(collection(db, 'customers'), {
      ...customerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const getCustomerByPhone = async (phone) => {
  try {
    const q = query(collection(db, 'customers'), where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting customer by phone:', error);
    throw error;
  }
};

export const getAllCustomers = async (limitCount = 100) => {
  try {
    const q = query(
      collection(db, 'customers'), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
};

export const createSampleCustomers = async () => {
  const sampleCustomers = [
    {
      name: 'Saman Perera',
      phone: '0771234567',
      email: 'saman@email.com',
      address: 'No. 123, Galle Road, Colombo 03',
      dateOfBirth: '1985-05-15',
      gender: 'Male'
    },
    {
      name: 'Kamala Silva',
      phone: '0779876543',
      email: 'kamala@email.com',
      address: 'No. 456, Kandy Road, Malabe',
      dateOfBirth: '1990-08-22',
      gender: 'Female'
    },
    {
      name: 'Nimal Fernando',
      phone: '0711122334',
      email: 'nimal@email.com',
      address: 'No. 789, Main Street, Negombo',
      dateOfBirth: '1978-12-10',
      gender: 'Male'
    }
  ];

  try {
    const promises = sampleCustomers.map(customer => addCustomer(customer));
    await Promise.all(promises);
    console.log('Sample customers added successfully');
  } catch (error) {
    console.error('Error creating sample customers:', error);
    throw error;
  }
};
