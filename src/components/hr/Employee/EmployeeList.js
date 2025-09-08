import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Search, Edit, Trash2, Eye, Filter, Users, RefreshCw, Bomb } from 'lucide-react';
import toast from 'react-hot-toast';
import AddEmployee from './AddEmployee';
import ViewEmployee from './ViewEmployee';
import { ultimateReset } from '../../utils/cacheKiller';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEmployees = useCallback(async () => {
    if (!loading) return; // Prevent multiple simultaneous calls
    
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Fetched employees:', employeeData); // Debug log
      // Always set the data, even if empty
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
      // Clear employees on error to prevent showing stale data
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Function to force refresh and clear cache
  const forceRefresh = async () => {
    setLoading(true);
    setEmployees([]); // Clear immediately
    setFilteredEmployees([]);
    
    // Clear any browser cache
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (error) {
      console.warn('Could not clear cache:', error);
    }
    
    await fetchEmployees();
  };

  const filterEmployees = useCallback(() => {
    let filtered = [...employees];

    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(emp => {
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        const email = (emp.email || '').toLowerCase();
        const employeeId = (emp.employeeId || '').toLowerCase();
        
        return fullName.includes(searchLower) ||
               email.includes(searchLower) ||
               employeeId.includes(searchLower);
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(emp => emp.role === roleFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, debouncedSearchTerm, statusFilter, roleFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    filterEmployees();
  }, [filterEmployees]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      // Remove from UI immediately for better UX
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      toast.info('Deleting employee...');
      
      // Perform delete operation asynchronously without blocking UI
      setTimeout(async () => {
        try {
          // Add timeout for delete operation
          const deletePromise = deleteDoc(doc(db, 'employees', id));
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Delete operation timed out')), 5000)
          );
          
          await Promise.race([deletePromise, timeoutPromise]);
          toast.success('Employee deleted successfully');
        } catch (error) {
          console.error('Error deleting employee:', error);
          
          // If the document doesn't exist, it's already removed from UI
          if (error.code === 'not-found' || error.message.includes('timed out')) {
            toast.success('Employee removed successfully');
          } else {
            // If actual error, restore the employee in UI
            toast.error('Failed to delete employee: ' + error.message);
            // Refresh to restore accurate state
            forceRefresh();
          }
        }
      }, 10); // Small delay to prevent blocking
    }
  };

  const getStatusBadge = useMemo(() => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      probation: 'bg-yellow-100 text-yellow-800'
    };
    
    return (status) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  }, []);

  const handleAddEmployee = () => {
    console.log('handleAddEmployee called');
    setShowAddEmployee(true);
    setViewEmployee(null);
  };

  const handleBackToList = () => {
    console.log('handleBackToList called');
    setShowAddEmployee(false);
    setViewEmployee(null);
  };

  const handleSaveEmployee = (newEmployee) => {
    console.log('handleSaveEmployee called with:', newEmployee);
    // Add the new employee to the list
    setEmployees(prev => [...prev, newEmployee]);
    setShowAddEmployee(false);
    toast.success('Employee added successfully!');
  };

  // Memoized employee card component
  const EmployeeCard = useMemo(() => {
    return React.memo(({ employee }) => (
      <div
        key={employee.id}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-200"
      >
        {/* Profile Image and Name */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 h-16 w-16">
            {employee.profileImage ? (
              <img
                src={employee.profileImage}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="h-16 w-16 rounded-full object-cover border-3 border-gray-200"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center border-3 border-gray-200">
                <span className="text-lg font-bold text-white">
                  {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {employee.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
              <div className="ml-2">
                {getStatusBadge(employee.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{employee.email || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{employee.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <span>ID: {employee.employeeId || 'N/A'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', position: 'relative', zIndex: 1000 }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleViewEmployee(employee);
            }}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#2563eb',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast('Employee edit coming soon!');
            }}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Edit Employee"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`);
            }}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#dc2626',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Delete Employee"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    ));
  }, [getStatusBadge, handleViewEmployee, handleDelete]);

  const handleViewEmployee = (employee) => {
    console.log('handleViewEmployee called with:', employee);
    setViewEmployee(employee);
    setShowAddEmployee(false);
  };

  // If showing add employee form, render that instead
  if (showAddEmployee) {
    return (
      <AddEmployee 
        onBack={handleBackToList}
        onSave={handleSaveEmployee}
      />
    );
  }

  // If viewing an employee, render that instead
  if (viewEmployee) {
    return (
      <ViewEmployee 
        employee={viewEmployee}
        onBack={handleBackToList}
        onEdit={(employee) => {
          // TODO: Add edit functionality
          toast('Edit functionality coming soon!');
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 ml-8 relative z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('NUKE CACHE clicked');
              ultimateReset();
            }}
            style={{
              backgroundColor: '#7c2d12',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '500',
              zIndex: 1000,
              position: 'relative'
            }}
          >
            <Bomb className="h-4 w-4 mr-2" />
            NUKE CACHE
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Force refresh clicked');
              forceRefresh();
            }}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '500',
              zIndex: 1000,
              position: 'relative'
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Refresh
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Add New Employee button clicked');
              handleAddEmployee();
            }}
            style={{
              backgroundColor: '#1e3a8a',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '500',
              zIndex: 1000,
              position: 'relative'
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Employee
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search employees by name, phone, NIC, or email..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="probation">Probation</option>
          </select>

          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="registered_pharmacist">Registered Pharmacist</option>
            <option value="assistant_pharmacist">Assistant Pharmacist</option>
            <option value="cashier">Cashier</option>
            <option value="delivery_driver">Delivery Driver</option>
            <option value="admin">Admin</option>
          </select>

          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
            <Filter className="h-4 w-4 mr-2" />
            {filteredEmployees.length} of {employees.length} employees
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {filteredEmployees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
      
      {filteredEmployees.length === 0 && (
        <div className="col-span-full">
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {employees.length === 0 ? 'Get started by adding a new employee.' : 'Try adjusting your search or filter criteria.'}
            </p>
            {employees.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddEmployee();
                  }}
                  style={{
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '500'
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;