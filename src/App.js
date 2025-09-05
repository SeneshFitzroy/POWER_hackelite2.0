import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PharmacyPOSFirebaseIntegrated from './pos/components/PharmacyPOSFirebaseIntegrated';
import './App.css';

function App() {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <Routes>
        <Route path="/" element={<PharmacyPOSFirebaseIntegrated />} />
        <Route path="/pos" element={<PharmacyPOSFirebaseIntegrated />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
