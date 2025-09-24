// ERP Dashboard - Inventory Navigation Fixed - Version 3.0
import React, { useState, useEffect } from "react"

function ModuleCard({ icon, title, description, delay, onClick, color }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const handleClick = () => {
    console.log(`[DEBUG] ModuleCard clicked: ${title}`)
    if (onClick) {
      onClick()
    } else {
      console.error(`[ERROR] No onClick handler for module: ${title}`)
    }
  }

  return (
    <div
      className={`module-card ${isVisible ? 'animate' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="module-icon" style={{background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`}}>
        {icon}
      </div>
      <h3 className="module-title">{title}</h3>
      <p className="module-description">{description}</p>
    </div>
  )
}

export default function ERPDashboard({ onPOSAccess, onSalesAccess, onHRAccess, onLegalAccess, onColdChainAccess, onInventoryAccess, onDeliveryAccess, onAdminAccess, onLogout }) {
  const [headerVisible, setHeaderVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHeaderVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const modules = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "HR",
      description: "Employee records, payroll, and workforce management",
      color: "#10B981", // Green for HR/People
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V19C17 19.5523 17.4477 20 18 20C18.5523 20 19 19.5523 19 19V13M9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18C8.32843 18 9 18.6716 9 19.5ZM20 19.5C20 20.3284 19.3284 21 18.5 21C17.6716 21 17 20.3284 17 19.5C17 18.6716 17.6716 18 18.5 18C19.3284 18 20 18.6716 20 19.5Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "POS",
      description: "Point of sale and retail operations",
      color: "#F59E0B", // Orange for Sales/POS
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 7C2 6.46957 2.21071 5.96086 2.58579 5.58579C2.96086 5.21071 3.46957 5 4 5H20C20.5304 5 21.0391 5.21071 21.4142 5.58579C21.7893 5.96086 22 6.46957 22 7V17C22 17.5304 21.7893 18.0391 21.4142 18.4142C21.0391 18.7893 20.5304 19 20 19H4C3.46957 19 2.96086 18.7893 2.58579 18.4142C2.21071 18.0391 2 17.5304 2 17V7Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 10H2M7 15H7.01M11 15H11.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Sales & Finance",
      description: "Sales tracking, accounting, and financial reporting",
      color: "#059669", // Dark Green for Finance/Money
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Legal",
      description: "Contract management and legal compliance",
      color: "#7C3AED", // Purple for Legal/Compliance
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Inventory",
      description: "Stock management and warehouse operations",
      color: "#DC2626", // Red for Inventory/Critical
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V7C2 6.46957 2.21071 5.96086 2.58579 5.58579C2.96086 5.21071 3.46957 5 4 5H12L15 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V15C22 15.5304 21.7893 16.0391 21.4142 16.4142C21.0391 16.7893 20.5304 17 20 17H19M5 17C5 18.1046 5.89543 19 7 19C8.10457 19 9 18.1046 9 17M5 17C5 15.8954 5.89543 15 7 15C8.10457 15 9 15.8954 9 17M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17M19 17C19 15.8954 18.1046 15 17 15C15.8954 15 15 15.8954 15 17M9 17H15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="10" r="2" fill="white"/>
        </svg>
      ),
      title: "Real-Time Delivery",
      description: "Live delivery tracking and logistics management",
      color: "#0EA5E9", // Blue for Logistics/Transport
    },

    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V21H21V3H3Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 8H17M7 12H17M7 16H13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 3V21M16 3V21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="8" r="1" fill="white"/>
          <circle cx="12" cy="12" r="1" fill="white"/>
          <circle cx="12" cy="16" r="1" fill="white"/>
        </svg>
      ),
      title: "Administration",
      description: "System admin, user management, and security monitoring",
      color: "#8B5CF6", // Purple for Reports/Analytics
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V19C17 19.5523 17.4477 20 18 20C18.5523 20 19 19.5523 19 19V13M9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18C8.32843 18 9 18.6716 9 19.5ZM20 19.5C20 20.3284 19.3284 21 18.5 21C17.6716 21 17 20.3284 17 19.5C17 18.6716 17.6716 18 18.5 18C19.3284 18 20 18.6716 20 19.5Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Cold Chain",
      description: "IoT monitoring for temperature and humidity control",
      color: "#1e40af", // Blue for Cold Chain/IoT
    },

  ]

  console.log('[DEBUG] Total modules:', modules.length, modules.map(m => m.title))
  console.log('[DEBUG] ERPDashboard callbacks:', {
    onDeliveryAccess: !!onDeliveryAccess,
    onColdChainAccess: !!onColdChainAccess
  })

  const handleModuleClick = (moduleTitle) => {
    console.log(`[DEBUG] Module clicked: ${moduleTitle}`)
    console.log('[DEBUG] Available callbacks:', {
      onPOSAccess: !!onPOSAccess,
      onSalesAccess: !!onSalesAccess,
      onHRAccess: !!onHRAccess,
      onLegalAccess: !!onLegalAccess,
      onColdChainAccess: !!onColdChainAccess,
      onInventoryAccess: !!onInventoryAccess,
      onDeliveryAccess: !!onDeliveryAccess,
      onAdminAccess: !!onAdminAccess
    })
    
    try {
      // INVENTORY NAVIGATION - USING PROPER CALLBACK
      if (moduleTitle === "Inventory" && onInventoryAccess) {
        console.log('[DEBUG] Navigating to Inventory...')
        onInventoryAccess()
        return
      }
      
      if (moduleTitle === "POS" && onPOSAccess) {
        console.log('[DEBUG] Navigating to POS...')
        onPOSAccess()
      } else if (moduleTitle === "Sales & Finance" && onSalesAccess) {
        console.log('[DEBUG] Navigating to Sales...')
        onSalesAccess()
      } else if (moduleTitle === "HR" && onHRAccess) {
        console.log('[DEBUG] Navigating to HR...')
        onHRAccess()
      } else if (moduleTitle === "Legal" && onLegalAccess) {
        console.log('[DEBUG] Navigating to Legal...')
        onLegalAccess()
      } else if (moduleTitle === "Cold Chain" && onColdChainAccess) {
        console.log('[DEBUG] Navigating to Cold Chain...')
        onColdChainAccess()
      } else if (moduleTitle === "Administration" && onAdminAccess) {
        console.log('[DEBUG] Navigating to Administration dashboard...')
        onAdminAccess()
      } else if ((moduleTitle === "Real-Time Delivery" || moduleTitle === "Delivery") && onDeliveryAccess) {
        console.log('[DEBUG] Navigating to Delivery...')
        onDeliveryAccess()

      } else {
        console.log(`[DEBUG] No handler found for module: ${moduleTitle}`)
        console.error(`[ERROR] Module navigation failed: ${moduleTitle}`)
      }
    } catch (error) {
      console.error(`[ERROR] Exception during navigation for ${moduleTitle}:`, error)
    }
  };

  return (
    <div className="dashboard-screen">
      {/* Header */}
      <div className={`dashboard-header ${headerVisible ? 'animate' : ''}`}>
        {/* Logo and Title */}
        <div className="dashboard-logo-title">
          <div className="dashboard-npk-logo">
            <img 
              src="/images/npk-logo.png" 
              alt="NPK New Pharmacy" 
              className="dashboard-logo-image"
            />
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="dashboard-logout">
          <button 
            onClick={onLogout}
            className="logout-button"
            title="Logout"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Logout</span>
          </button>
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
              color={module.color}
              delay={400 + index * 100}
              onClick={() => {
                console.log(`ModuleCard clicked: ${module.title}`)
                handleModuleClick(module.title)
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="footer-text">
        <p>by CoreERP Systems</p>
      </div>
    </div>
  )
}
