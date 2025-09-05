import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PharmacyPOSCleanFinal from './pos/components/PharmacyPOSCleanFinal';
import './App.css';

function App() {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <Routes>
        <Route path="/" element={<PharmacyPOSCleanFinal />} />
        <Route path="/pos" element={<PharmacyPOSCleanFinal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
