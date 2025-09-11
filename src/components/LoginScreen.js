import   const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false), { useState } from "react"
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase/config'
// Uncomment the line below if you put the logo in src/assets/images/
// import npkLogo from "../assets/images/npk-logo.png"

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: "Please enter your email first" })
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Please enter a valid email" })
      return
    }

    setResetLoading(true)
    setErrors({})

    try {
      await sendPasswordResetEmail(auth, email)
      setResetEmailSent(true)
      setErrors({})
    } catch (error) {
      console.error("Password reset error:", error)
      setErrors({ general: "Failed to send reset email. Please try again." })
    } finally {
      setResetLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log("Login attempted with:", { email, password })
      onLoginSuccess()
    }, 2000)
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="p-6 pb-4">
          {/* Company Brand Logo */}
          <div className="login-brand-logo">
            <img 
              src="/images/npk-logo.png" 
              alt="NPK New Pharmacy" 
              className="login-logo"
            />
          </div>

          <div className="text-center mb-6">
            <h2 className="login-title">ආයුබෝවන් - Welcome</h2>
            <p className="login-subtitle">Access your PharmaCore ERP System</p>
          </div>
        </div>

        <div className="p-6" style={{paddingTop: 0}}>
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Messages */}
            {errors.general && <p className="error-text" style={{textAlign: 'center', marginBottom: '1rem'}}>{errors.general}</p>}
            
            {/* Success Message for Password Reset */}
            {resetEmailSent && (
              <div style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                textAlign: 'center',
                border: '1px solid #c3e6cb'
              }}>
                Password reset email sent! Check your inbox.
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* Forgot Password Link */}
            <div className="forgot-password-container">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="forgot-link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {resetLoading ? "Sending..." : "Forgot Password?"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="footer-text">
        <p>by NPK New Pharmacy Kalutara</p>
      </div>
    </div>
  )
}
