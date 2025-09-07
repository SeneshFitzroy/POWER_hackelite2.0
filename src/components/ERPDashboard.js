import React, { useState, useEffect } from "react"

function ModuleCard({ icon, title, description, delay, onClick }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-xl border-0 shadow-lg shadow-[#4169E1]/10 backdrop-blur-sm bg-white/80 hover:bg-white hover:shadow-[#4169E1]/20 rounded-lg ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      onClick={onClick}
    >
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#4169E1] to-[#4169E1]/80 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
          {icon}
        </div>
        <h3 className="font-bold text-[#4169E1] mb-2 group-hover:text-[#4169E1]/90 transition-colors">{title}</h3>
        <p className="text-sm text-[#4169E1]/70 group-hover:text-[#4169E1]/80 transition-colors">{description}</p>
      </div>
    </div>
  )
}

export default function ERPDashboard() {
  const [headerVisible, setHeaderVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHeaderVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const modules = [
    {
      icon: <span className="text-2xl">👥</span>,
      title: "HR",
      description: "Employee records, payroll, and workforce management",
    },
    {
      icon: <span className="text-2xl">🛒</span>,
      title: "POS",
      description: "Point of sale and retail operations",
    },
    {
      icon: <span className="text-2xl">💰</span>,
      title: "Sales & Finance",
      description: "Sales tracking, accounting, and financial reporting",
    },
    {
      icon: <span className="text-2xl">⚖️</span>,
      title: "Legal",
      description: "Contract management and legal compliance",
    },
    {
      icon: <span className="text-2xl">📦</span>,
      title: "Inventory",
      description: "Stock management and warehouse operations",
    },
    {
      icon: <span className="text-2xl">🚚</span>,
      title: "Delivery",
      description: "Logistics and delivery management",
    },
    {
      icon: <span className="text-2xl">⚙️</span>,
      title: "Administration",
      description: "System settings and user management",
    },
  ]

  const handleModuleClick = (moduleTitle) => {
    console.log(`Module clicked: ${moduleTitle}`)
    // Module navigation logic will be implemented here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4169E1]/5 via-white to-[#4169E1]/10 p-6">
      {/* Header */}
      <div
        className={`text-center mb-12 transition-all duration-1000 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
        }`}
      >
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4169E1] to-[#4169E1]/80 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
            <div className="relative">
              <div className="w-8 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-8 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#4169E1] mb-1">PharmaCore</h1>
            <p className="text-[#4169E1]/70 font-medium">Enterprise Resource Planning</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#4169E1] mb-3">Welcome to Your Dashboard</h2>
          <p className="text-[#4169E1]/70 text-lg">Access all your business modules from one centralized platform</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.title}
              icon={module.icon}
              title={module.title}
              description={module.description}
              delay={400 + index * 100}
              onClick={() => handleModuleClick(module.title)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 right-6">
        <p className="text-[#4169E1]/60 italic text-sm font-light">by CoreERP Solutions</p>
      </div>
    </div>
  )
}
