import React, { useState, useEffect } from "react"

function ModuleCard({ icon, title, description, delay, onClick }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`module-card ${isVisible ? 'animate' : ''}`}
      onClick={onClick}
    >
      <div className="module-icon">
        {icon}
      </div>
      <h3 className="module-title">{title}</h3>
      <p className="module-description">{description}</p>
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
      icon: <span style={{fontSize: '1.5rem'}}>👥</span>,
      title: "HR",
      description: "Employee records, payroll, and workforce management",
    },
    {
      icon: <span style={{fontSize: '1.5rem'}}>🛒</span>,
      title: "POS",
      description: "Point of sale and retail operations",
    },
    {
      icon: <span style={{fontSize: '1.5rem'}}>💰</span>,
      title: "Sales & Finance",
      description: "Sales tracking, accounting, and financial reporting",
    },
    {
      icon: <span style={{fontSize: '1.5rem'}}>⚖️</span>,
      title: "Legal",
      description: "Contract management and legal compliance",
    },
    {
      icon: <span style={{fontSize: '1.5rem'}}>📦</span>,
      title: "Inventory",
      description: "Stock management and warehouse operations",
    },
    {
      icon: <span style={{fontSize: '1.5rem'}}>🚚</span>,
      title: "Delivery",
      description: "Logistics and delivery management",
    },
    {
      icon: <span style={{fontSize: '1.5rem'}}>⚙️</span>,
      title: "Administration",
      description: "System settings and user management",
    },
  ]

  const handleModuleClick = (moduleTitle) => {
    console.log(`Module clicked: ${moduleTitle}`)
    // Module navigation logic will be implemented here
  }

  return (
    <div className="dashboard-screen">
      {/* Header */}
      <div className={`dashboard-header ${headerVisible ? 'animate' : ''}`}>
        {/* Logo and Title */}
        <div className="dashboard-logo-title">
          <div className="dashboard-logo">
            <div className="dashboard-cross"></div>
          </div>
          <div>
            <h1 className="dashboard-title">PharmaCore</h1>
            <p className="dashboard-subtitle">Enterprise Resource Planning</p>
          </div>
        </div>

        <div className="dashboard-welcome">
          <h2 className="dashboard-welcome-title">Welcome to Your Dashboard</h2>
          <p className="dashboard-welcome-text">Access all your business modules from one centralized platform</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="modules-grid">
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
      <div className="footer-text">
        <p>by CoreERP Solutions</p>
      </div>
    </div>
  )
}
