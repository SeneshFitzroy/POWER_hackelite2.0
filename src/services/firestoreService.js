import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore Service Class
class FirestoreService {
  
  // Products Collection Methods
  async saveProducts(products) {
    try {
      const batch = [];
      for (const product of products) {
        const productRef = doc(db, 'medicines', product.id.toString());
        batch.push(setDoc(productRef, {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }));
      }
      await Promise.all(batch);
      console.log('Products saved successfully to Firestore');
      return { success: true, message: 'Products saved successfully' };
    } catch (error) {
      console.error('Error saving products:', error);
      return { success: false, error: error.message };
    }
  }

  async getProducts(filters = {}) {
    try {
      let q = collection(db, 'medicines');
      
      // Apply filters
      if (filters.category && filters.category !== 'all') {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters.brand) {
        q = query(q, where('brand', '==', filters.brand));
      }
      
      if (filters.requiresPrescription !== undefined) {
        q = query(q, where('requiresPrescription', '==', filters.requiresPrescription));
      }
      
      // Add ordering
      q = query(q, orderBy('name'));
      
      // Add limit if specified
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: products };
    } catch (error) {
      console.error('Error getting products:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProduct(productId, updates) {
    try {
      const productRef = doc(db, 'medicines', productId);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true, message: 'Product updated successfully' };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteProduct(productId) {
    try {
      const productRef = doc(db, 'medicines', productId);
      await deleteDoc(productRef);
      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  }

  // Orders Collection Methods
  async saveOrder(orderData) {
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      return { success: true, orderId: orderRef.id };
    } catch (error) {
      console.error('Error saving order:', error);
      return { success: false, error: error.message };
    }
  }

  async getOrders(userId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: orders };
    } catch (error) {
      console.error('Error getting orders:', error);
      return { success: false, error: error.message };
    }
  }

  // User Preferences Methods
  async saveUserPreferences(userId, preferences) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true, message: 'Preferences saved successfully' };
    } catch (error) {
      console.error('Error saving preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Analytics Methods
  async logSearch(searchTerm, resultsCount) {
    try {
      await addDoc(collection(db, 'search_analytics'), {
        searchTerm,
        resultsCount,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging search:', error);
    }
  }

  async logProductView(productId, productName) {
    try {
      await addDoc(collection(db, 'product_analytics'), {
        productId,
        productName,
        action: 'view',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging product view:', error);
    }
  }

  async logCartAction(productId, action) {
    try {
      await addDoc(collection(db, 'cart_analytics'), {
        productId,
        action, // 'add', 'remove', 'checkout'
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging cart action:', error);
    }
  }
}

export default new FirestoreService();
