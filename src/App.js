import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PharmacyPOSProfessional from './pos/components/PharmacyPOSProfessional';
import './App.css';

function App() {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <Routes>
        <Route path="/" element={<PharmacyPOSProfessional />} />
        <Route path="/pos" element={<PharmacyPOSProfessional />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
