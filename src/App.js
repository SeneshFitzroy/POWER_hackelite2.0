import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PharmacyPOSComplete from './pos/components/PharmacyPOSComplete';
import './App.css';

function App() {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <Routes>
        <Route path="/" element={<PharmacyPOSComplete />} />
        <Route path="/pos" element={<PharmacyPOSComplete />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
