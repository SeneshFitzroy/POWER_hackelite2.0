import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('assistant'); // Default to most restrictive
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Role definitions
  const roles = {
    owner: {
      name: 'Owner',
      permissions: [
        'view_all_modules',
        'edit_medicines',
        'manage_suppliers',
        'approve_purchase_orders',
        'manage_quarantine',
        'edit_compliance',
        'manage_users',
        'view_reports',
        'system_settings'
      ]
    },
    main_pharmacist: {
      name: 'Main Pharmacist',
      permissions: [
        'view_all_modules',
        'edit_medicines',
        'manage_suppliers',
        'approve_purchase_orders',
        'manage_quarantine',
        'view_compliance',
        'view_reports'
      ]
    },
    assistant_pharmacist: {
      name: 'Assistant Pharmacist',
      permissions: [
        'view_stock',
        'view_quarantine',
        'view_compliance',
        'edit_medicines_basic',
        'create_purchase_orders',
        'view_purchase_orders'
      ]
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!userRole || !roles[userRole]) return false;
    return roles[userRole].permissions.includes(permission);
  };

  // Check if user can perform action
  const canPerform = (action) => {
    const actionPermissions = {
      'edit_medicines': 'edit_medicines',
      'edit_medicines_basic': 'edit_medicines_basic',
      'manage_suppliers': 'manage_suppliers',
      'approve_purchase_orders': 'approve_purchase_orders',
      'manage_quarantine': 'manage_quarantine',
      'edit_compliance': 'edit_compliance',
      'view_reports': 'view_reports',
      'system_settings': 'system_settings'
    };

    const requiredPermission = actionPermissions[action];
    return requiredPermission ? hasPermission(requiredPermission) : false;
  };

  // Get user role info
  const getRoleInfo = () => {
    return roles[userRole] || roles.assistant_pharmacist;
  };

  // Simulate user login (in real app, this would come from authentication)
  const login = (email, password) => {
    // Mock authentication - in real app, this would be API call
    const mockUsers = {
      'owner@pharmacy.com': { role: 'owner', name: 'John Owner' },
      'pharmacist@pharmacy.com': { role: 'main_pharmacist', name: 'Dr. Jane Smith' },
      'assistant@pharmacy.com': { role: 'assistant_pharmacist', name: 'Mike Assistant' }
    };

    const userData = mockUsers[email];
    if (userData && password === 'password') {
      setUser(userData);
      setUserRole(userData.role);
      setLoading(false);
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  // Logout
  const logout = () => {
    setUser(null);
    setUserRole('assistant');
    setLoading(false);
  };

  // Initialize with default user for demo
  useEffect(() => {
    // For demo purposes, set a default user
    setUser({ role: 'main_pharmacist', name: 'Dr. Jane Smith' });
    setUserRole('main_pharmacist');
    setLoading(false);
  }, []);

  const value = {
    userRole,
    user,
    loading,
    roles,
    hasPermission,
    canPerform,
    getRoleInfo,
    login,
    logout
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
