import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  DeleteForever, 
  Warning, 
  CheckCircle, 
  Storage,
  Cancel
} from '@mui/icons-material';
import { clearAllFirebaseData, clearCollection } from '../utils/clearFirebaseData';

const FirebaseDataCleaner = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleClearAll = async () => {
    if (confirmText !== 'DELETE ALL DATA') {
      alert('Please type "DELETE ALL DATA" to confirm');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await clearAllFirebaseData();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: 'Error: ' + error.message
      });
    } finally {
      setLoading(false);
      setConfirmDialog(false);
      setConfirmText('');
    }
  };

  const collections = [
    { name: 'employees', description: 'All employee records' },
    { name: 'licenses', description: 'Professional licenses' },
    { name: 'payrolls', description: 'Payroll records' },
    { name: 'performance_reviews', description: 'Performance reviews' },
    { name: 'attendance', description: 'Attendance records' },
    { name: 'medicines', description: 'Medicine inventory' },
    { name: 'patients', description: 'Patient records' },
    { name: 'transactions', description: 'Sales transactions' }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Storage sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="error">
          Firebase Data Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Clear all data from Firebase to reset your application to a clean state
        </Typography>
      </Box>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ⚠️ DANGER ZONE ⚠️
        </Typography>
        <Typography>
          This will permanently delete ALL data from your Firebase database. 
          This action cannot be undone!
        </Typography>
      </Alert>

      <Typography variant="h6" gutterBottom>
        Collections that will be cleared:
      </Typography>
      
      <List sx={{ mb: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
        {collections.map((collection) => (
          <ListItem key={collection.name}>
            <ListItemIcon>
              <DeleteForever color="error" />
            </ListItemIcon>
            <ListItemText 
              primary={collection.name}
              secondary={collection.description}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<DeleteForever />}
          onClick={() => setConfirmDialog(true)}
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Clearing Data...
            </>
          ) : (
            'Clear All Firebase Data'
          )}
        </Button>
      </Box>

      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          icon={result.success ? <CheckCircle /> : <Warning />}
        >
          <Typography variant="h6">
            {result.success ? '✅ Success!' : '❌ Error!'}
          </Typography>
          <Typography>{result.message}</Typography>
          {result.deletedCount && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Total documents deleted: {result.deletedCount}
            </Typography>
          )}
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>
          <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
          Confirm Data Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to permanently delete ALL data from Firebase. This includes:
          </Typography>
          <List dense>
            {collections.map((collection) => (
              <ListItem key={collection.name}>
                <ListItemText primary={`• ${collection.name}`} />
              </ListItem>
            ))}
          </List>
          <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
            Type <strong>"DELETE ALL DATA"</strong> to confirm:
          </Typography>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type: DELETE ALL DATA"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #f44336',
              borderRadius: '4px',
              backgroundColor: '#fff'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setConfirmDialog(false);
              setConfirmText('');
            }}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleClearAll}
            color="error"
            variant="contained"
            disabled={confirmText !== 'DELETE ALL DATA' || loading}
            startIcon={<DeleteForever />}
          >
            Delete All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FirebaseDataCleaner;
