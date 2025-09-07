import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  Save, 
  FileImage, 
  Building2, 
  User, 
  Calendar,
  Shield,
  X,
  Camera,
  MapPin,
  Globe,
  CreditCard,
  Phone,
  Mail,
  UserCircle,
  Award,
  Bell,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  Plus,
  Edit3
} from 'lucide-react';

// Simple image popup for form previews
const ImagePreviewPopup = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
        >
          <X size={32} />
        </button>
        <img 
          src={imageSrc} 
          alt="Preview" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

const LegalForm = () => {
  const [formData, setFormData] = useState({
    // Documentation
    pharmacyImages: [],
    businessRegistrationImage: '',
    
    // Pharmacy Details
    pharmacyName: 'New Pharmacy Kalutara',
    pharmacyAddress: '212 Galle Rd, Kalutara 12000',
    pharmacyWebsite: 'lankanumbers.com',
    brNumber: '',
    pharmacyEmail: '',
    pharmacyMobile: '',
    pharmacyLandline: '',
    
    // Owner Information
    ownerName: '',
    ownerNIC: '',
    ownerEmail: '',
    ownerPhone: '',
    
    // Responsible Pharmacist
    pharmacistName: '',
    pharmacistRegNumber: '',
    
    // License & Renewal
    licenseRenewalDate: '',
    licenseReminder: true
  });

  // State for dropdowns
  const [openSections, setOpenSections] = useState({
    pharmacyDetails: true,
    ownerInfo: true,
    pharmacist: true,
    license: true
  });

  // State for image popups
  const [popupImage, setPopupImage] = useState(null);
  // State for editing image titles
  const [editingTitleIndex, setEditingTitleIndex] = useState(null);
  const [titleInput, setTitleInput] = useState('');

  const [loading, setLoading] = useState(false);

  // Load existing data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'legalDocuments'));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setFormData(doc.data());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, fieldName, isMultiple = false) => {
    const files = e.target.files;
    
    if (isMultiple) {
      // Handle multiple file uploads
      const fileArray = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          fileArray.push({
            src: event.target.result,
            title: 'Untitled Document',
            id: Date.now() + i // Simple ID generation
          });
          if (fileArray.length === files.length) {
            setFormData(prev => ({
              ...prev,
              [fieldName]: [...prev[fieldName], ...fileArray]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      // Handle single file upload
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            [fieldName]: event.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePharmacyImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.pharmacyImages];
      newImages.splice(index, 1);
      return { ...prev, pharmacyImages: newImages };
    });
  };

  const startEditingTitle = (index, currentTitle) => {
    setEditingTitleIndex(index);
    setTitleInput(currentTitle);
  };

  const saveTitle = (index) => {
    setFormData(prev => {
      const newImages = [...prev.pharmacyImages];
      newImages[index].title = titleInput;
      return { ...prev, pharmacyImages: newImages };
    });
    setEditingTitleIndex(null);
    setTitleInput('');
  };

  const cancelEditing = () => {
    setEditingTitleIndex(null);
    setTitleInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use a fixed document ID for simplicity
      const docRef = doc(collection(db, 'legalDocuments'));
      await setDoc(docRef, formData);
      toast.success('Legal details saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save legal details');
    } finally {
      setLoading(false);
    }
  };

  // Toggle section visibility
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Open image in popup
  const openImagePopup = (imageSrc) => {
    setPopupImage(imageSrc);
  };

  // Close image popup
  const closeImagePopup = () => {
    setPopupImage(null);
  };

  // Section header component with dropdown
  const DropdownSectionHeader = ({ 
    icon: Icon, 
    title, 
    isOpen, 
    onToggle,
    subtitle 
  }) => (
    <div 
      className="flex items-center justify-between cursor-pointer p-4 bg-gray-100 rounded-lg mb-4"
      onClick={onToggle}
    >
      <div className="flex items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 mr-3">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
      <div className="text-gray-500">
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
    </div>
  );

  // Input group component
  const InputGroup = ({ label, children, icon: Icon }) => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
        {Icon && <Icon size={16} className="mr-2 text-gray-500" />}
        {label}
      </label>
      {children}
    </div>
  );

  // Styled input component
  const StyledInput = ({ icon: Icon, ...props }) => (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={18} className="text-gray-400" />
        </div>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
          Icon ? 'pl-10' : ''
        }`}
      />
    </div>
  );

  // Styled textarea component
  const StyledTextarea = ({ icon: Icon, ...props }) => (
    <div className="relative">
      {Icon && (
        <div className="absolute top-3 left-3">
          <Icon size={18} className="text-gray-400" />
        </div>
      )}
      <textarea
        {...props}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
          Icon ? 'pl-10' : ''
        }`}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white mr-4">
            <FileImage size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Legal Documentation</h1>
            <p className="text-gray-600">Manage all legal documents and information for your pharmacy</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Documentation Section - No dropdown */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <div className="flex items-start mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mr-4">
                <FileImage size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Documentation</h2>
                <p className="text-gray-600">Upload required legal documents and certificates</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Legal Documents Upload */}
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FileImage size={18} className="mr-2 text-blue-500" />
                  Legal Documents & Certificates
                </h3>
                <p className="text-sm text-gray-600 mb-4">Upload medical council registration, pharmacist license, degree certificates, etc.</p>
                
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload files</span>
                        <input 
                          type="file" 
                          multiple 
                          className="sr-only" 
                          onChange={(e) => handleFileChange(e, 'pharmacyImages', true)}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
                
                {/* Preview of uploaded images */}
                {formData.pharmacyImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents ({formData.pharmacyImages.length})</h4>
                    <div className="space-y-3">
                      {formData.pharmacyImages.map((imageObj, index) => (
                        <div key={imageObj.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-start">
                            <div 
                              className="cursor-pointer flex-shrink-0 mr-3"
                              onClick={() => openImagePopup(imageObj.src)}
                            >
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                                <FileImage size={24} className="text-gray-400" />
                              </div>
                            </div>
                            <div className="flex-grow">
                              {editingTitleIndex === index ? (
                                <div className="flex items-center">
                                  <input
                                    type="text"
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    className="flex-grow px-2 py-1 text-sm border border-gray-300 rounded"
                                    placeholder="Enter document title"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => saveTitle(index)}
                                    className="ml-2 text-green-600 hover:text-green-800"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="ml-1 text-gray-600 hover:text-gray-800"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-800">{imageObj.title}</span>
                                  <button
                                    type="button"
                                    onClick={() => startEditingTitle(index, imageObj.title)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-1">Click image to preview</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePharmacyImage(index)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Direct Image Preview for Legal Documents */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Document Previews</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {formData.pharmacyImages.map((imageObj, index) => (
                          <div 
                            key={`preview-${imageObj.id}`}
                            className="border rounded-lg p-2 bg-white cursor-pointer relative group"
                            onClick={() => openImagePopup(imageObj.src)}
                          >
                            <div className="w-full h-20 flex items-center justify-center overflow-hidden rounded">
                              <img 
                                src={imageObj.src} 
                                alt={imageObj.title} 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.parentElement.innerHTML = '<div class="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center"><FileImage size={16} class="text-gray-400" /></div>';
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all rounded-lg">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                            </div>
                            <p className="text-xs text-gray-600 mt-1 text-center truncate">{imageObj.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* BR Image Upload */}
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <CreditCard size={18} className="mr-2 text-blue-500" />
                  Business Registration
                </h3>
                <p className="text-sm text-gray-600 mb-4">Upload your Business Registration document</p>
                
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload file</span>
                        <input 
                          type="file" 
                          className="sr-only" 
                          onChange={(e) => handleFileChange(e, 'businessRegistrationImage')}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
                
                {/* Preview of BR image */}
                {formData.businessRegistrationImage && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h4>
                    <div 
                      className="border rounded-lg p-2 bg-gray-50 cursor-pointer relative group"
                      onClick={() => openImagePopup(formData.businessRegistrationImage)}
                    >
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 flex items-center justify-center">
                        <FileImage size={32} className="text-gray-400" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all rounded-lg">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">Click to preview</p>
                    
                    {/* Direct Image Preview for Business Registration */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Image Preview</h4>
                      <div className="flex justify-center">
                        <div 
                          className="border rounded-lg p-2 bg-white cursor-pointer relative group w-full max-w-xs"
                          onClick={() => openImagePopup(formData.businessRegistrationImage)}
                        >
                          <div className="w-full h-40 flex items-center justify-center overflow-hidden rounded">
                            <img 
                              src={formData.businessRegistrationImage} 
                              alt="Business Registration" 
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentElement.innerHTML = '<div class="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center"><FileImage size={24} class="text-gray-400" /></div>';
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all rounded-lg">
                            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                          </div>
                          <p className="text-xs text-gray-600 mt-2 text-center">Business Registration</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Pharmacy Details Section - With dropdown */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <DropdownSectionHeader 
              icon={Building2}
              title="Pharmacy Details"
              subtitle="Basic information about your pharmacy business"
              isOpen={openSections.pharmacyDetails}
              onToggle={() => toggleSection('pharmacyDetails')}
            />
            
            {openSections.pharmacyDetails && (
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Pharmacy Name" icon={Building2}>
                    <StyledInput
                      type="text"
                      name="pharmacyName"
                      value={formData.pharmacyName}
                      onChange={handleInputChange}
                      placeholder="Enter pharmacy name"
                    />
                  </InputGroup>
                  
                  <InputGroup label="Address" icon={MapPin}>
                    <StyledTextarea
                      name="pharmacyAddress"
                      value={formData.pharmacyAddress}
                      onChange={handleInputChange}
                      placeholder="Enter full address"
                      rows="3"
                    />
                  </InputGroup>
                  
                  <InputGroup label="Website/Directory Link" icon={Globe}>
                    <StyledInput
                      type="text"
                      name="pharmacyWebsite"
                      value={formData.pharmacyWebsite}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </InputGroup>
                  
                  <InputGroup label="BR Number" icon={CreditCard}>
                    <StyledInput
                      type="text"
                      name="brNumber"
                      value={formData.brNumber}
                      onChange={handleInputChange}
                      placeholder="Enter BR number"
                    />
                  </InputGroup>
                  
                  <InputGroup label="Email" icon={Mail}>
                    <StyledInput
                      type="email"
                      name="pharmacyEmail"
                      value={formData.pharmacyEmail}
                      onChange={handleInputChange}
                      placeholder="pharmacy@example.com"
                    />
                  </InputGroup>
                  
                  <InputGroup label="Mobile Number" icon={Phone}>
                    <StyledInput
                      type="text"
                      name="pharmacyMobile"
                      value={formData.pharmacyMobile}
                      onChange={handleInputChange}
                      placeholder="+94 7X XXX XXXX"
                    />
                  </InputGroup>
                  
                  <InputGroup label="Landline Number" icon={Phone}>
                    <StyledInput
                      type="text"
                      name="pharmacyLandline"
                      value={formData.pharmacyLandline}
                      onChange={handleInputChange}
                      placeholder="+94 XX XXX XXXX"
                    />
                  </InputGroup>
                </div>
              </div>
            )}
          </div>
          
          {/* Owner Information Section - With dropdown */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <DropdownSectionHeader 
              icon={User}
              title="Owner Information"
              subtitle="Details of the pharmacy owner"
              isOpen={openSections.ownerInfo}
              onToggle={() => toggleSection('ownerInfo')}
            />
            
            {openSections.ownerInfo && (
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Owner Name" icon={UserCircle}>
                    <StyledInput
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Enter owner's full name"
                    />
                  </InputGroup>
                  
                  <InputGroup label="NIC" icon={CreditCard}>
                    <StyledInput
                      type="text"
                      name="ownerNIC"
                      value={formData.ownerNIC}
                      onChange={handleInputChange}
                      placeholder="Enter NIC number"
                    />
                  </InputGroup>
                  
                  <InputGroup label="Email" icon={Mail}>
                    <StyledInput
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      placeholder="owner@example.com"
                    />
                  </InputGroup>
                  
                  <InputGroup label="Phone Number" icon={Phone}>
                    <StyledInput
                      type="text"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                      placeholder="+94 7X XXX XXXX"
                    />
                  </InputGroup>
                </div>
              </div>
            )}
          </div>
          
          {/* Responsible Pharmacist Section - With dropdown */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <DropdownSectionHeader 
              icon={Award}
              title="Responsible Pharmacist"
              subtitle="Details of the licensed pharmacist in charge"
              isOpen={openSections.pharmacist}
              onToggle={() => toggleSection('pharmacist')}
            />
            
            {openSections.pharmacist && (
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Pharmacist Name" icon={User}>
                    <StyledInput
                      type="text"
                      name="pharmacistName"
                      value={formData.pharmacistName}
                      onChange={handleInputChange}
                      placeholder="Enter pharmacist's full name"
                    />
                  </InputGroup>
                  
                  <InputGroup label="Registration Number" icon={Award}>
                    <StyledInput
                      type="text"
                      name="pharmacistRegNumber"
                      value={formData.pharmacistRegNumber}
                      onChange={handleInputChange}
                      placeholder="Enter registration number"
                    />
                  </InputGroup>
                </div>
              </div>
            )}
          </div>
          
          {/* License & Renewal Section - With dropdown */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <DropdownSectionHeader 
              icon={Shield}
              title="License & Renewal"
              subtitle="License information and renewal settings"
              isOpen={openSections.license}
              onToggle={() => toggleSection('license')}
            />
            
            {openSections.license && (
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Next License Renewal Date" icon={Calendar}>
                    <StyledInput
                      type="date"
                      name="licenseRenewalDate"
                      value={formData.licenseRenewalDate}
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      name="licenseReminder"
                      checked={formData.licenseReminder}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 block text-sm font-medium text-gray-700 flex items-center">
                      <Bell size={16} className="mr-2 text-gray-500" />
                      Notify before expiry
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Saving...' : 'Save Legal Details'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Image Popup */}
      {popupImage && (
        <ImagePreviewPopup imageSrc={popupImage} onClose={closeImagePopup} />
      )}
    </div>
  );
};

export default LegalForm;