import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = useCallback(async () => {
    try {
      const docRef = doc(db, 'employees', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setEmployee({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error('Employee not found');
        navigate('/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

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

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Employee not found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8 ml-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/employees')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
        </div>
        <Link
          to={`/employees/${id}/edit`}
          className="btn-primary flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {employee.profileImageUrl ? (
                <img className="h-20 w-20 rounded-full object-cover" src={employee.profileImageUrl} alt="Profile" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-xl font-medium text-white">
                    {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h2>
                <div className="ml-4">
                  {getStatusBadge(employee.status)}
                </div>
              </div>
              <p className="text-lg text-gray-600">
                {employee.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <p className="text-sm text-gray-500">Employee ID: {employee.employeeId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{employee.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{employee.phone}</span>
            </div>
            {employee.address?.permanent && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Permanent Address</p>
                  <p className="text-sm text-gray-600">{employee.address.permanent}</p>
                </div>
              </div>
            )}
            {employee.address?.current && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Current Address</p>
                  <p className="text-sm text-gray-600">{employee.address.current}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Contract Type</p>
              <p className="text-sm text-gray-600 capitalize">{employee.contractType}</p>
            </div>
            {employee.startDate && (
              <div>
                <p className="text-sm font-medium text-gray-900">Start Date</p>
                <p className="text-sm text-gray-600">{new Date(employee.startDate).toLocaleDateString()}</p>
              </div>
            )}
            {employee.salary && (
              <div>
                <p className="text-sm font-medium text-gray-900">Salary</p>
                <p className="text-sm text-gray-600">LKR {employee.salary.toLocaleString()}</p>
              </div>
            )}
            {employee.dateOfBirth && (
              <div>
                <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                <p className="text-sm text-gray-600">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
              </div>
            )}
            {employee.nic && (
              <div>
                <p className="text-sm font-medium text-gray-900">NIC Number</p>
                <p className="text-sm text-gray-600">{employee.nic}</p>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
          {employee.emergencyContact?.name ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Name</p>
                <p className="text-sm text-gray-600">{employee.emergencyContact.name}</p>
              </div>
              {employee.emergencyContact.relationship && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Relationship</p>
                  <p className="text-sm text-gray-600">{employee.emergencyContact.relationship}</p>
                </div>
              )}
              {employee.emergencyContact.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{employee.emergencyContact.phone}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No emergency contact information</p>
          )}
        </div>
      </div>

      {/* Documents */}
      {employee.documents && employee.documents.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employee.documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                    <p className="text-xs text-gray-500">{doc.name}</p>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:text-primary-800"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {employee.education && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
            <p className="text-sm text-gray-600">{employee.education}</p>
          </div>
        )}

        {employee.certifications && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
            <p className="text-sm text-gray-600">{employee.certifications}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;