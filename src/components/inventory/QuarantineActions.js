import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip
} from '@mui/material';
import {
  Warning as WarningIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { quarantineService } from '../../services/quarantineService';

const QuarantineActions = ({ 
  medicine, 
  open, 
  onClose, 
  action = 'quarantine',
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!formData.reason) {
        setError('Please select a reason');
        return;
      }

      let result;
      switch (action) {
        case 'quarantine':
          result = await quarantineService.quarantineMedicine(
            medicine.id,
            formData.reason,
            'quarantined'
          );
          break;
        case 'release':
          result = await quarantineService.releaseFromQuarantine(
            medicine.id,
            formData.reason,
            'released'
          );
          break;
        case 'expire':
          result = await quarantineService.markAsExpired(
            medicine.id,
            formData.reason,
            'expired'
          );
          break;
        default:
          throw new Error('Invalid action');
      }

      if (result.success) {
        onSuccess && onSuccess(result.message);
        onClose();
        setFormData({ reason: '', notes: '' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionInfo = () => {
    switch (action) {
      case 'quarantine':
        return {
          title: 'Quarantine Medicine',
          icon: <WarningIcon sx={{ color: '#d97706' }} />,
          color: 'warning',
          description: 'Move this medicine to quarantine status'
        };
      case 'release':
        return {
          title: 'Release from Quarantine',
          icon: <CheckCircleIcon sx={{ color: '#059669' }} />,
          color: 'success',
          description: 'Release this medicine back to active status'
        };
      case 'expire':
        return {
          title: 'Mark as Expired',
          icon: <CancelIcon sx={{ color: '#dc2626' }} />,
          color: 'error',
          description: 'Mark this medicine as expired'
        };
      default:
        return {
          title: 'Action',
          icon: <WarningIcon />,
          color: 'default',
          description: 'Perform action on this medicine'
        };
    }
  };

  const actionInfo = getActionInfo();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actionInfo.icon}
          {actionInfo.title}
        </Box>
      </DialogTitle>
      <DialogContent>
        {medicine && (
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>{medicine.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {medicine.manufacturer} - Batch: {medicine.batchNumber || 'N/A'}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              {actionInfo.description}
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Reason *</InputLabel>
              <Select
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              >
                <MenuItem value="quality_issue">Quality Issue</MenuItem>
                <MenuItem value="damaged_packaging">Damaged Packaging</MenuItem>
                <MenuItem value="temperature_exposure">Temperature Exposure</MenuItem>
                <MenuItem value="contamination">Contamination</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="recall">Recall</MenuItem>
                <MenuItem value="regulatory_issue">Regulatory Issue</MenuItem>
                <MenuItem value="customer_complaint">Customer Complaint</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add any additional details or observations..."
            />

            {/* Current Status Display */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Current Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Status: ${medicine.status || 'active'}`}
                  color={medicine.status === 'quarantined' ? 'warning' : 
                         medicine.status === 'expired' ? 'error' : 'success'}
                  size="small"
                />
                <Chip
                  label={`Stock: ${medicine.stockQuantity || 0}`}
                  color="default"
                  size="small"
                />
                {medicine.expiryDate && (
                  <Chip
                    label={`Expires: ${(medicine.expiryDate && typeof medicine.expiryDate === 'object' && medicine.expiryDate.toDate 
                      ? medicine.expiryDate.toDate() 
                      : new Date(medicine.expiryDate)).toLocaleDateString()}`}
                    color="default"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || !formData.reason}
          sx={{
            backgroundColor: actionInfo.color === 'warning' ? '#d97706' :
                           actionInfo.color === 'success' ? '#059669' :
                           actionInfo.color === 'error' ? '#dc2626' : '#1e40af',
            '&:hover': {
              backgroundColor: actionInfo.color === 'warning' ? '#b45309' :
                             actionInfo.color === 'success' ? '#047857' :
                             actionInfo.color === 'error' ? '#b91c1c' : '#1d4ed8'
            }
          }}
        >
          {loading ? 'Processing...' : actionInfo.title}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuarantineActions;
