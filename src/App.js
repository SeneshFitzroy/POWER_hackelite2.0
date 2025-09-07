import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import SplashScreen from './components/SplashScreen'
import LoginScreen from './components/LoginScreen'
import ERPDashboard from './components/ERPDashboard'
import PharmacyPOSFirebaseIntegrated from './pos/components/PharmacyPOSFirebaseIntegrated'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash')

  const handleSplashComplete = () => {
    setCurrentScreen('login')
  }

  const handleLoginSuccess = () => {
    setCurrentScreen('dashboard')
  }

  const handlePOSAccess = () => {
    window.location.href = '/pos'
  }

  return (
    <Routes>
      <Route path="/pos" element={
        <Box sx={{ height: '100vh', overflow: 'hidden' }}>
          <PharmacyPOSFirebaseIntegrated />
        </Box>
      } />
      <Route path="/" element={
        <div className="App">
          {currentScreen === 'splash' && <SplashScreen onGetStarted={handleSplashComplete} />}
          {currentScreen === 'login' && <LoginScreen onLoginSuccess={handleLoginSuccess} />}
          {currentScreen === 'dashboard' && <ERPDashboard onPOSAccess={handlePOSAccess} />}
        </div>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
