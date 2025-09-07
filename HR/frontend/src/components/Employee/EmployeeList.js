import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Search, Edit, Trash2, Eye, Filter, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchEmployees = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterEmployees = useCallback(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(emp => emp.role === roleFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, statusFilter, roleFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    filterEmployees();
  }, [filterEmployees]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        setEmployees(employees.filter(emp => emp.id !== id));
        toast.success('Employee deleted successfully');
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      probation: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 ml-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        <Link
          to="/employees/new"
          className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Employee
        </Link>
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
          <div
            key={employee.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-primary-300 transition-all duration-200 hover:-translate-y-1"
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
                  <div className="h-16 w-16 rounded-full bg-primary-500 flex items-center justify-center border-3 border-gray-200">
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
            <div className="flex justify-end space-x-2">
              <Link
                to={`/employees/${employee.id}`}
                className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                to={`/employees/${employee.id}/edit`}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Edit Employee"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <button
                onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Employee"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
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
                <Link
                  to="/employees/new"
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;