// Temporary Firebase mock configuration
// This allows the app to start without Firebase SDK installed

const firebaseConfig = {
  apiKey: "AIzaSyDTAKCjMujRsVoEuYTEF3liJ3oXVInjsY8",
  authDomain: "coreerp-b9cce.firebaseapp.com", 
  databaseURL: "https://coreerp-b9cce-default-rtdb.firebaseio.com",
  projectId: "coreerp-b9cce",
  storageBucket: "coreerp-b9cce.firebasestorage.app",
  messagingSenderId: "698444534353",
  appId: "1:698444534353:web:4ce64a92a4cf32a7fb5e70",
  measurementId: "G-E1798JRT6J"
};

// Mock Firebase auth
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: (email, password) => {
    console.log('Mock auth sign in:', email);
    return Promise.resolve({ user: { uid: 'mock-user', email } });
  },
  signOut: () => {
    console.log('Mock auth sign out');
    return Promise.resolve();
  },
  onAuthStateChanged: (callback) => {
    // Simulate authentication state change
    setTimeout(() => callback({ uid: 'mock-user', email: 'admin@example.com' }), 1000);
    return () => {}; // unsubscribe function
  }
};

// Mock Firestore
export const db = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      get: () => {
        console.log(`Mock get document: ${collectionName}/${docId}`);
        return Promise.resolve({ 
          exists: true, 
          id: docId,
          data: () => ({ name: 'Mock Data', createdAt: new Date() })
        });
      },
      set: (data) => {
        console.log(`Mock set document: ${collectionName}/${docId}`, data);
        return Promise.resolve();
      },
      update: (data) => {
        console.log(`Mock update document: ${collectionName}/${docId}`, data);
        return Promise.resolve();
      },
      delete: () => {
        console.log(`Mock delete document: ${collectionName}/${docId}`);
        return Promise.resolve();
      }
    }),
    add: (data) => {
      console.log(`Mock add document to ${collectionName}:`, data);
      return Promise.resolve({ id: `mock-${Date.now()}` });
    },
    where: (field, operator, value) => ({
      get: () => {
        console.log(`Mock query: ${collectionName} where ${field} ${operator} ${value}`);
        return Promise.resolve({ docs: [] });
      },
      onSnapshot: (callback) => {
        setTimeout(() => callback({ docs: [] }), 100);
        return () => {};
      }
    }),
    orderBy: (field, direction) => ({
      get: () => {
        console.log(`Mock query: ${collectionName} orderBy ${field} ${direction}`);
        return Promise.resolve({ docs: [] });
      },
      onSnapshot: (callback) => {
        setTimeout(() => callback({ docs: [] }), 100);
        return () => {};
      }
    }),
    get: () => {
      console.log(`Mock get collection: ${collectionName}`);
      return Promise.resolve({ docs: [] });
    },
    onSnapshot: (callback) => {
      setTimeout(() => callback({ docs: [] }), 100);
      return () => {};
    }
  })
};

// Mock Storage
export const storage = {
  ref: (path) => ({
    put: (file) => {
      console.log(`Mock upload file to: ${path}`);
      return Promise.resolve();
    },
    getDownloadURL: () => {
      console.log(`Mock get download URL for: ${path}`);
      return Promise.resolve('https://mock-url.com/file.jpg');
    }
  })
};

// Mock Firebase object for compatibility
const firebase = {
  auth: () => auth,
  firestore: () => db,
  storage: () => storage,
  firestore: {
    FieldValue: {
      increment: (value) => {
        console.log(`Mock increment by: ${value}`);
        return value;
      },
      serverTimestamp: () => {
        console.log('Mock server timestamp');
        return new Date();
      }
    }
  }
};

export default firebase;
