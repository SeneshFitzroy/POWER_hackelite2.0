import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// Sample data for initializing collections - DISABLED
const sampleEmployees = [
  // All sample employees removed to prevent automatic data creation
];

const sampleLicenses = [
  // All sample licenses removed
];

const sampleAttendance = [
  // All sample attendance removed
];

const samplePayroll = [
  // All sample payroll removed
];

const samplePerformanceReviews = [
  // All sample performance reviews removed
];

// Function to check if collection exists and has data
const checkCollectionExists = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking collection ${collectionName}:`, error);
    return false;
  }
};

// Function to initialize a collection with sample data
const initializeCollection = async (collectionName, sampleData) => {
  try {
    console.log(`Initializing ${collectionName} collection...`);
    
    for (const item of sampleData) {
      await addDoc(collection(db, collectionName), item);
    }
    
    console.log(`✅ ${collectionName} collection initialized with ${sampleData.length} records`);
    return true;
  } catch (error) {
    console.error(`❌ Error initializing ${collectionName}:`, error);
    return false;
  }
};

// Main initialization function - DISABLED TO PREVENT AUTOMATIC DATA CREATION
export const initializeFirestore = async () => {
  console.log('� Firestore initialization is DISABLED to prevent sample data creation');
  console.log('✅ Please add employee data manually through the forms');
  return true; // Return success without doing anything
};

// Function to reset all collections - DISABLED
export const resetFirestore = async () => {
  console.log('🚫 Reset function is DISABLED to prevent data creation');
  console.log('✅ Use the Firebase Data Cleaner at /clear-data instead');
  return true; // Return success without doing anything
};