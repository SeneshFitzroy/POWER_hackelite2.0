import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PharmacyPOSClean from './pos/components/PharmacyPOSClean';
import './App.css';

function App() {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <Routes>
        <Route path="/" element={<PharmacyPOSClean />} />
        <Route path="/pos" element={<PharmacyPOSClean />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
