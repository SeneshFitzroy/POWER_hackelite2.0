import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Storage,
  People,
  LocalPharmacy,
  Assignment,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { initializeSampleData } from '../../services/dataInitService';

const SetupComponent = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);

  const initializeData = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await initializeSampleData();
      setResult(response);
      
      if (response.success) {
        setSetupComplete(true);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleDataInfo = [
    {
      icon: <LocalPharmacy />,
      title: 'Sample Medicines',
      description: '5 medicines including prescription and OTC drugs',
      items: ['Paracetamol (OTC)', 'Amoxicillin (Prescription)', 'Aspirin (OTC)', 'Omeprazole (Prescription)', 'Cough Syrup (OTC)']
    },
    {
      icon: <People />,
      title: 'Sample Employees',
      description: '2 employees with different roles',
      items: ['Dr. Sarah Johnson (Pharmacist) - EMP001', 'Michael Chen (Cashier) - EMP002']
    },
    {
      icon: <Assignment />,
      title: 'Sample Patients',
      description: '2 patient records with medical history',
      items: ['John Doe - 0771111111', 'Mary Smith - 0773333333']
    },
    {
      icon: <Storage />,
      title: 'Pharmacy Registration',
      description: 'Sample pharmacy license information',
      items: ['Registration Number: PH-2024-001', 'License: LIC123456']
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Pharmacy POS Setup
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Initialize your pharmacy database with sample data to get started quickly. 
        This will create sample medicines, employees, patients, and pharmacy registration information.
      </Typography>

      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          icon={result.success ? <CheckCircle /> : <Error />}
        >
          {result.message}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sample Data Overview
        </Typography>
        
        <List>
          {sampleDataInfo.map((category, index) => (
            <ListItem key={index} sx={{ py: 2 }}>
              <ListItemIcon>
                {category.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {category.title}
                    </Typography>
                    {setupComplete && (
                      <Chip 
                        label="Added" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {category.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {category.items.map((item, itemIndex) => (
                        <Chip 
                          key={itemIndex}
                          label={item} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={initializeData}
          disabled={loading || setupComplete}
          startIcon={loading ? <CircularProgress size={20} /> : <Storage />}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Initializing...' : setupComplete ? 'Setup Complete' : 'Initialize Sample Data'}
        </Button>
        
        {setupComplete && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Sample data has been successfully initialized. You can now access the POS system at{' '}
            <strong>/pos</strong> or continue to the main dashboard.
          </Typography>
        )}
      </Box>

      {setupComplete && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'success.light' }}>
          <Typography variant="h6" gutterBottom>
            🎉 Setup Complete! Here's what you can do next:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Visit /pos to access the POS system (no login required)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Use Employee ID 'EMP001' or 'EMP002' for checkout verification" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Use Pharmacy Registration 'PH-2024-001' for prescription medicines" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Test patient lookup with phone numbers 0771111111 or 0773333333" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Search for medicines like 'Paracetamol', 'Amoxicillin', etc." />
            </ListItem>
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SetupComponent;
