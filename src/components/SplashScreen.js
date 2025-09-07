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
    <div className="min-h-screen bg-[#4169E1] bg-gradient-to-br from-[#4169E1] via-[#3b5fbf] to-[#2d4da3] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main Logo Container */}
      <div className="flex flex-col items-center z-10">
        {/* Medical Cross Logo */}
        <div
          className={`relative mb-8 transition-all duration-1000 ease-out ${
            logoAnimation ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-12"
          }`}
        >
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-2xl">
              {/* Outer glow effect */}
              <circle cx="70" cy="70" r="65" fill="white" className="opacity-20 animate-pulse" />
              {/* Main circle background */}
              <circle cx="70" cy="70" r="60" fill="white" className="opacity-95" />
              {/* Medical cross - royal blue */}
              <rect x="58" y="30" width="24" height="80" fill="#4169E1" rx="6" />
              <rect x="30" y="58" width="80" height="24" fill="#4169E1" rx="6" />
              {/* Inner highlight for depth */}
              <rect x="60" y="32" width="20" height="76" fill="#4169E1" className="opacity-90" rx="4" />
              <rect x="32" y="60" width="76" height="20" fill="#4169E1" className="opacity-90" rx="4" />
              {/* Center highlight */}
              <circle cx="70" cy="70" r="8" fill="white" className="opacity-30" />
            </svg>
          </div>
        </div>

        <div
          className={`text-center transition-all duration-1200 ease-out delay-300 ${
            textAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1
            className="text-5xl md:text-6xl font-bold text-white font-sans tracking-tight mb-4 drop-shadow-2xl"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
          >
            PharmaCore
          </h1>

          <p
            className="text-white text-xl font-medium tracking-wide mb-6 drop-shadow-lg"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            by CoreERP Solutions
          </p>

          {/* Enhanced accent line */}
          <div className="w-40 h-1 bg-white mx-auto rounded-full shadow-lg"></div>
        </div>
      </div>

      {/* Subtle loading indicator */}
      <div className="absolute bottom-12 flex space-x-2">
        <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  )
}
