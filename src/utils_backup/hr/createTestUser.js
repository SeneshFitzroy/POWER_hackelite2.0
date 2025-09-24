import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';

// Function to create a test user for development
export const createTestUser = async () => {
  try {
    const testEmail = 'admin@pharmacy.com';
    const testPassword = 'pharmacy123';
    
    console.log('Creating test user...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    
    console.log('✅ Test user created successfully:', userCredential.user.email);
    return {
      success: true,
      user: userCredential.user,
      credentials: { email: testEmail, password: testPassword }
    };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Test user already exists');
      return {
        success: true,
        message: 'User already exists',
        credentials: { email: 'admin@pharmacy.com', password: 'pharmacy123' }
      };
    } else {
      console.error('❌ Error creating test user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Function to get test credentials
export const getTestCredentials = () => {
  return {
    email: 'admin@pharmacy.com',
    password: 'pharmacy123'
  };
};