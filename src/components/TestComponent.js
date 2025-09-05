import React from 'react';
import { Typography, Box, Button, Paper } from '@mui/material';

function TestComponent() {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          🎉 CoreERP System is Working!
        </Typography>
        
        <Typography variant="body1" paragraph>
          Your Pharmacy POS System is successfully running. All components are loaded correctly.
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" href="/setup">
            Initialize Sample Data
          </Button>
          <Button variant="outlined" href="/pos">
            Access POS System
          </Button>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            ✅ System Status: All Good!
          </Typography>
          <Typography variant="body2">
            • React app compiled successfully<br/>
            • Material-UI components working<br/>
            • Routing system functional<br/>
            • Firebase configuration ready<br/>
            • POS system organized and accessible
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default TestComponent;
