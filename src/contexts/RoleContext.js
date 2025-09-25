import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);

  // Module access definitions based on roles
  const getAvailableModules = () => {
    if (!userRole || !userRole.permissions) return [];
    
    const moduleMap = {
      'hr': { name: 'HR', icon: 'people', description: 'Employee records, payroll, and workforce management' },
      'sales': { name: 'Sales', icon: 'trending_up', description: 'Sales management and customer relationships' },
      'pos': { name: 'POS', icon: 'point_of_sale', description: 'Point of Sale system for transactions' },
      'inventory': { name: 'Inventory', icon: 'inventory', description: 'Stock management and tracking' },
      'coldchain': { name: 'Cold Chain', icon: 'ac_unit', description: 'Temperature-controlled storage monitoring' },
      'legal': { name: 'Legal Docs', icon: 'gavel', description: 'Legal documents and compliance' },
      'ecommerce': { name: 'E-commerce', icon: 'shopping_cart', description: 'Online store administration' },
      'delivery': { name: 'Delivery', icon: 'local_shipping', description: 'Delivery and logistics management' },
      'reports': { name: 'Reports', icon: 'assessment', description: 'Business intelligence and reporting' },
      'settings': { name: 'Settings', icon: 'settings', description: 'System configuration and management' }
    };

    return userRole.permissions
      .filter(permission => moduleMap[permission])
      .map(permission => ({
        key: permission,
        ...moduleMap[permission]
      }));
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!userRole || !userRole.permissions) {
      return false;
    }
    return userRole.permissions.includes(permission);
  };

  // Check if user can access a module
  const canAccessModule = (moduleKey) => {
    return hasPermission(moduleKey);
  };

  // Get user role display name
  const getRoleDisplayName = () => {
    return userRole?.name || 'User';
  };

  // Get user role type
  const getUserRole = () => {
    return userRole?.role || 'USER';
  };

  useEffect(() => {
    setLoading(false);
  }, [user, userRole]);

  const value = {
    user,
    userRole,
    loading,
    hasPermission,
    canAccessModule,
    getAvailableModules,
    getRoleDisplayName,
    getUserRole
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
