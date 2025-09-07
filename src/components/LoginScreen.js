import React, { useState } from "react"

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
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
    <div className="min-h-screen bg-gradient-to-br from-[#4169E1]/5 via-white to-[#4169E1]/10 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border-0 shadow-[#4169E1]/20 backdrop-blur-sm">
        <div className="p-6 pb-4">
          {/* Company Brand Placeholder */}
          <div className="w-full h-12 border-2 border-dashed border-[#4169E1]/30 rounded flex items-center justify-center mb-6">
            <span className="text-[#4169E1]/70 text-sm font-medium">Company Brand Here</span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#4169E1] mb-2">Welcome Back</h2>
            <p className="text-[#4169E1]/70">Sign in to your PharmaCore account</p>
          </div>
        </div>

        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[#4169E1] font-medium block">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] ${
                  errors.email ? "border-red-500" : "border-[#4169E1]/30"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-[#4169E1] font-medium block">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] ${
                    errors.password ? "border-red-500" : "border-[#4169E1]/30"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4169E1]/60 hover:text-[#4169E1]"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4169E1] hover:bg-[#4169E1]/90 text-white py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl rounded-md disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                className="text-[#4169E1]/70 hover:text-[#4169E1] text-sm font-medium transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="absolute bottom-6 right-6">
        <p className="text-[#4169E1]/60 italic text-sm font-light">by CoreERP Solutions</p>
      </div>
    </div>
  )
}
