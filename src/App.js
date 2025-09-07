import React, { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import LoginScreen from './components/LoginScreen'
import ERPDashboard from './components/ERPDashboard'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash')

  const handleSplashComplete = () => {
    setCurrentScreen('login')
  }

  const handleLoginSuccess = () => {
    setCurrentScreen('dashboard')
  }

  return (
    <div className="App">
      {currentScreen === 'splash' && <SplashScreen onGetStarted={handleSplashComplete} />}
      {currentScreen === 'login' && <LoginScreen onLoginSuccess={handleLoginSuccess} />}
      {currentScreen === 'dashboard' && <ERPDashboard />}
    </div>
  )
}

export default App
