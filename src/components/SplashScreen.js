import { useEffect, useState } from "react"

export default function SplashScreen({ onGetStarted }) {
  const [isVisible, setIsVisible] = useState(false)
  const [logoAnimation, setLogoAnimation] = useState(false)
  const [textAnimation, setTextAnimation] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    setTimeout(() => {
      setLogoAnimation(true)
    }, 300)

    setTimeout(() => {
      setTextAnimation(true)
    }, 800)

    // Auto-transition after 3 seconds
    setTimeout(() => {
      onGetStarted()
    }, 3000)
  }, [onGetStarted])

  return (
    <div className="splash-screen">
      {/* Animated background elements */}
      <div className="splash-bg-elements">
        <div className="splash-bg-circle"></div>
        <div className="splash-bg-circle"></div>
        <div className="splash-bg-circle"></div>
      </div>

      {/* Main Logo Container */}
      <div className="splash-logo-container">
        {/* Medical Cross Logo */}
        <div className={`splash-logo ${logoAnimation ? 'animate' : ''}`}>
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140" style={{filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))'}}>
              {/* Outer glow effect */}
              <circle cx="70" cy="70" r="65" fill="white" className="splash-bg-circle" style={{opacity: 0.2}} />
              {/* Main circle background */}
              <circle cx="70" cy="70" r="60" fill="white" style={{opacity: 0.95}} />
              {/* Medical cross - royal blue */}
              <rect x="58" y="30" width="24" height="80" fill="#4169E1" rx="6" />
              <rect x="30" y="58" width="80" height="24" fill="#4169E1" rx="6" />
              {/* Inner highlight for depth */}
              <rect x="60" y="32" width="20" height="76" fill="#4169E1" style={{opacity: 0.9}} rx="4" />
              <rect x="32" y="60" width="76" height="20" fill="#4169E1" style={{opacity: 0.9}} rx="4" />
              {/* Center highlight */}
              <circle cx="70" cy="70" r="8" fill="white" style={{opacity: 0.3}} />
            </svg>
          </div>
        </div>

        <div className={`splash-text ${textAnimation ? 'animate' : ''}`}>
          <h1 className="splash-title">
            PharmaCore
          </h1>

          <p className="splash-subtitle">
            by CoreERP Solutions
          </p>

          {/* Enhanced accent line */}
          <div className="splash-accent-line"></div>
        </div>
      </div>

      {/* Subtle loading indicator */}
      <div className="splash-loading">
        <div className="splash-dot"></div>
        <div className="splash-dot"></div>
        <div className="splash-dot"></div>
      </div>
    </div>
  )
}
