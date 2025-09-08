import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Award, Plus, AlertTriangle, Calendar, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const LicenseTracking = () => {
  const [licenses, setLicenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    licenseType: '',
    licenseNumber: '',
    issuedDate: '',
    expiryDate: '',
    issuingAuthority: '',
    verificationUrl: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch employees
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);

      // Fetch licenses
      const licensesSnapshot = await getDocs(collection(db, 'licenses'));
      const licenseData = licensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLicenses(licenseData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch license data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employee = employees.find(emp => emp.id === formData.employeeId);
      const licenseData = {
        ...formData,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        updatedAt: new Date().toISOString()
      };

      if (editingLicense) {
        await updateDoc(doc(db, 'licenses', editingLicense.id), licenseData);
        toast.success('License updated successfully');
      } else {
        licenseData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'licenses'), licenseData);
        toast.success('License added successfully');
      }

      setShowForm(false);
      setEditingLicense(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving license:', error);
      toast.error('Failed to save license');
    }
  };

  const handleEdit = (license) => {
    setEditingLicense(license);
    setFormData({
      employeeId: license.employeeId,
      licenseType: license.licenseType,
      licenseNumber: license.licenseNumber,
      issuedDate: license.issuedDate,
      expiryDate: license.expiryDate,
      issuingAuthority: license.issuingAuthority,
      verificationUrl: license.verificationUrl || '',
      status: license.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id, licenseType) => {
    if (window.confirm(`Are you sure you want to delete this ${licenseType} license?`)) {
      try {
        await deleteDoc(doc(db, 'licenses', id));
        setLicenses(licenses.filter(license => license.id !== id));
        toast.success('License deleted successfully');
      } catch (error) {
        console.error('Error deleting license:', error);
        toast.error('Failed to delete license');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      licenseType: '',
      licenseNumber: '',
      issuedDate: '',
      expiryDate: '',
      issuingAuthority: '',
      verificationUrl: '',
      status: 'active'
    });
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (daysUntilExpiry < 0) {
      return { status: 'expired', days: Math.abs(daysUntilExpiry), color: 'text-red-600' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', days: daysUntilExpiry, color: 'text-yellow-600' };
    } else {
      return { status: 'valid', days: daysUntilExpiry, color: 'text-green-600' };
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const licenseTypes = [
    'Pharmacist License',
    'Assistant Pharmacist License',
    'Driving License',
    'Professional Certification',
    'Safety Certification',
    'Other'
  ];

  const authorities = [
    'NMRA (National Medicines Regulatory Authority)',
    'Department of Motor Traffic',
    'Ministry of Health',
    'Professional Board',
    'Other'
  ];

  // Group licenses by expiry status
  const expiredLicenses = licenses.filter(license => {
    const expiry = getExpiryStatus(license.expiryDate);
    return expiry.status === 'expired';
  });

  const expiringLicenses = licenses.filter(license => {
    const expiry = getExpiryStatus(license.expiryDate);
    return expiry.status === 'expiring';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">License Tracking</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingLicense(null);
              resetForm();
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add License
          </button>
        </div>

        {/* Alert Cards */}
        {(expiredLicenses.length > 0 || expiringLicenses.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {expiredLicenses.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-red-800">Expired Licenses</h3>
                </div>
                <p className="mt-2 text-sm text-red-700">
                  {expiredLicenses.length} license(s) have expired and need immediate attention.
                </p>
              </div>
            )}

            {expiringLicenses.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-yellow-600 mr-3" />
                  <h3 className="text-lg font-semibold text-yellow-800">Expiring Soon</h3>
                </div>
                <p className="mt-2 text-sm text-yellow-700">
                  {expiringLicenses.length} license(s) will expire within 30 days.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Licenses</p>
                <p className="text-2xl font-bold text-gray-900">{licenses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {licenses.filter(l => l.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{expiringLicenses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{expiredLicenses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* License Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingLicense ? 'Edit License' : 'Add New License'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingLicense(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                      <select
                        value={formData.employeeId}
                        onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                        className="input"
                        required
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
                      <select
                        value={formData.licenseType}
                        onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
                        className="input"
                        required
                      >
                        <option value="">Select Type</option>
                        {licenseTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      className="input"
                      placeholder="Enter license number"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issued Date</label>
                      <input
                        type="date"
                        value={formData.issuedDate}
                        onChange={(e) => setFormData({...formData, issuedDate: e.target.value})}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                        className="input"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Authority</label>
                    <select
                      value={formData.issuingAuthority}
                      onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                      className="input"
                      required
                    >
                      <option value="">Select Authority</option>
                      {authorities.map(auth => (
                        <option key={auth} value={auth}>{auth}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.verificationUrl}
                      onChange={(e) => setFormData({...formData, verificationUrl: e.target.value})}
                      className="input"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingLicense(null);
                        resetForm();
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingLicense ? 'Update' : 'Add'} License
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Licenses Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">All Licenses</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {licenses.map((license) => {
                  const expiryInfo = getExpiryStatus(license.expiryDate);
                  
                  return (
                    <tr key={license.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{license.employeeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{license.licenseType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{license.licenseNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(parseISO(license.expiryDate), 'MMM dd, yyyy')}
                        </div>
                        <div className={`text-xs font-medium ${expiryInfo.color}`}>
                          {expiryInfo.status === 'expired' 
                            ? `Expired ${expiryInfo.days} days ago`
                            : expiryInfo.status === 'expiring'
                            ? `Expires in ${expiryInfo.days} days`
                            : `Valid for ${expiryInfo.days} days`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(license.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          {license.verificationUrl && (
                            <a
                              href={license.verificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                              title="Verify License"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleEdit(license)}
                            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            title="Edit License"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(license.id, license.licenseType)}
                            className="text-gray-600 hover:text-red-600 transition-colors duration-200"
                            title="Delete License"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {licenses.length === 0 && (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No licenses found</h3>
              <p className="text-sm text-gray-500">
                Get started by adding a license for an employee.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseTracking;