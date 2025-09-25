import React, { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { db } from '../../../firebase/config';
import { Button, Container, Typography, Box, TextField, Paper } from '@mui/material';
import toast from 'react-hot-toast';

const TestFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState('');
  const [readData, setReadData] = useState([]);

  const testCollections = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      console.log('Current auth state:', auth.currentUser);
      
      const testDataObj = {
        testName: testData || 'Firestore Test',
        timestamp: new Date().toISOString(),
        testValue: Math.random()
      };

      // Test writing to different collections
      console.log('Testing write to "test" collection...');
      const docRef1 = await addDoc(collection(db, 'test'), testDataObj);
      console.log('Successfully wrote to "test" collection with ID:', docRef1.id);
      
      console.log('Testing write to "employees" collection...');
      const docRef2 = await addDoc(collection(db, 'employees'), testDataObj);
      console.log('Successfully wrote to "employees" collection with ID:', docRef2.id);
      
      console.log('Testing write to "test_employees" collection...');
      const docRef3 = await addDoc(collection(db, 'test_employees'), testDataObj);
      console.log('Successfully wrote to "test_employees" collection with ID:', docRef3.id);
      
      toast.success('All tests successful! Data written to multiple collections.');
    } catch (error) {
      console.error('Error in collection tests:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast.error('Test failed! Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const testRead = async () => {
    setLoading(true);
    try {
      console.log('Attempting to read from "employees" collection...');
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setReadData(data);
      console.log('Successfully read from "employees" collection:', data);
      toast.success(`Read ${data.length} documents from employees collection.`);
    } catch (error) {
      console.error('Error reading from employees collection:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast.error('Read test failed! Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Firestore Collection Tests
        </Typography>
        <Typography variant="body1" gutterBottom>
          Click the buttons below to test if we can read/write to different Firestore collections
        </Typography>
        
        <TextField
          fullWidth
          label="Test Data"
          value={testData}
          onChange={(e) => setTestData(e.target.value)}
          sx={{ my: 2 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            onClick={testCollections}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test All Collections'}
          </Button>
          <Button
            variant="outlined"
            onClick={testRead}
            disabled={loading}
          >
            {loading ? 'Reading...' : 'Read Employees'}
          </Button>
        </Box>
        
        {readData.length > 0 && (
          <Paper sx={{ mt: 3, p: 2, textAlign: 'left' }}>
            <Typography variant="h6" gutterBottom>
              Read Data:
            </Typography>
            <pre>{JSON.stringify(readData, null, 2)}</pre>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default TestFirestore;