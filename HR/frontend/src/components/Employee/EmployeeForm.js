import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [documents, setDocuments] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nic: '',
      employeeId: '',
      role: '',
      status: 'probation',
      contractType: 'permanent',
      startDate: '',
      salary: '',
      address: {
        permanent: '',
        current: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      education: '',
      certifications: ''
    }
  });

  const fetchEmployee = useCallback(async () => {
    try {
      const docRef = doc(db, 'employees', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        Object.keys(data).forEach(key => {
          setValue(key, data[key]);
        });
        setProfileImage(data.profileImageUrl);
        setDocuments(data.documents || []);
      } else {
        toast.error('Employee not found');
        navigate('/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to fetch employee data');
    }
  }, [id, navigate, setValue]);

  useEffect(() => {
    if (isEdit) {
      fetchEmployee();
    }
  }, [isEdit, fetchEmployee]);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const imageRef = ref(storage, `employees/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      setProfileImage(downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (file, type) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const docRef = ref(storage, `documents/${Date.now()}_${file.name}`);
      await uploadBytes(docRef, file);
      const downloadURL = await getDownloadURL(docRef);
      
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type,
        url: downloadURL,
        uploadDate: new Date().toISOString()
      };
      
      setDocuments(prev => [...prev, newDoc]);
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const employeeData = {
        ...data,
        profileImageUrl: profileImage,
        documents,
        updatedAt: new Date().toISOString()
      };

      if (isEdit) {
        await updateDoc(doc(db, 'employees', id), employeeData);
        toast.success('Employee updated successfully');
      } else {
        employeeData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'employees'), employeeData);
        toast.success('Employee added successfully');
      }
      
      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/employees')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Image */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {profileImage ? (
                <img className="h-20 w-20 rounded-full object-cover" src={profileImage} alt="Profile" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">No Image</span>
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="hidden"
                id="profile-image"
              />
              <label
                htmlFor="profile-image"
                className="btn-secondary cursor-pointer flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </label>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                className="input mt-1"
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                className="input mt-1"
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                className="input mt-1"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                className="input mt-1"
                {...register('phone', { required: 'Phone is required' })}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                className="input mt-1"
                {...register('dateOfBirth')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">NIC Number</label>
              <input
                type="text"
                className="input mt-1"
                {...register('nic')}
              />
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee ID *</label>
              <input
                type="text"
                className="input mt-1"
                {...register('employeeId', { required: 'Employee ID is required' })}
              />
              {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role *</label>
              <select
                className="input mt-1"
                {...register('role', { required: 'Role is required' })}
              >
                <option value="">Select Role</option>
                <option value="owner">Owner</option>
                <option value="registered_pharmacist">Registered Pharmacist</option>
                <option value="assistant_pharmacist">Assistant Pharmacist</option>
                <option value="cashier">Cashier</option>
                <option value="delivery_driver">Delivery Driver</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select className="input mt-1" {...register('status')}>
                <option value="probation">Probation</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contract Type</label>
              <select className="input mt-1" {...register('contractType')}>
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                className="input mt-1"
                {...register('startDate')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Salary (LKR)</label>
              <input
                type="number"
                className="input mt-1"
                {...register('salary')}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
              <textarea
                rows={3}
                className="input mt-1"
                {...register('address.permanent')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Address</label>
              <textarea
                rows={3}
                className="input mt-1"
                {...register('address.current')}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Name</label>
              <input
                type="text"
                className="input mt-1"
                {...register('emergencyContact.name')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship</label>
              <input
                type="text"
                className="input mt-1"
                {...register('emergencyContact.relationship')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                className="input mt-1"
                {...register('emergencyContact.phone')}
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
          
          <div className="space-y-4">
            {['NIC Copy', 'CV', 'Certificates', 'License', 'Contract'].map((docType) => (
              <div key={docType} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="text-sm font-medium">{docType}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(e.target.files[0], docType)}
                  className="hidden"
                  id={`doc-${docType}`}
                />
                <label
                  htmlFor={`doc-${docType}`}
                  className="btn-secondary text-sm cursor-pointer"
                >
                  Upload
                </label>
              </div>
            ))}
          </div>

          {documents.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Documents</h4>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Employee' : 'Add Employee')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;