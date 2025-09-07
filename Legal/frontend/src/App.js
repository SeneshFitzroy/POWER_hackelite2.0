import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LegalForm from './components/LegalForm';
import { db } from './firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { 
  X, 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  Building2, 
  User, 
  Award, 
  Shield, 
  Camera, 
  CreditCard, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Eye,
  FileImage,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';
import './index.css';

// Image popup component with zoom functionality
const ImagePopup = ({ imageSrc, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!imageSrc) return null;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetView = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e) => handleMouseMove(e);
    const handleMouseUpGlobal = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, dragStart]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          <button
            onClick={onClose}
            className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          >
            <X size={24} />
          </button>
          <button
            onClick={handleZoomIn}
            className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          >
            <Plus size={24} />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          >
            <Minus size={24} />
          </button>
          <button
            onClick={handleRotate}
            className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          >
            <RotateCw size={24} />
          </button>
          <button
            onClick={resetView}
            className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>

        {/* Image container */}
        <div 
          className="relative overflow-hidden"
          onWheel={handleWheel}
        >
          <img 
            src={imageSrc} 
            alt="Document" 
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center',
              cursor: isDragging ? 'grabbing' : 'grab',
              transition: isDragging ? 'none' : 'transform 0.2s ease'
            }}
            className="max-w-none"
            onMouseDown={handleMouseDown}
          />
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          Zoom: {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

// View all details component
const ViewAllDetails = () => {
  const [legalData, setLegalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupImage, setPopupImage] = useState(null);
  // State for dropdowns
  const [openSections, setOpenSections] = useState({
    pharmacyDetails: true,
    ownerInfo: true,
    pharmacist: true,
    license: true
  });

  useEffect(() => {
    const fetchLegalData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'legalDocuments'));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setLegalData(doc.data());
        }
      } catch (error) {
        console.error('Error fetching legal data:', error);
        toast.error('Failed to fetch legal data');
      } finally {
        setLoading(false);
      }
    };

    fetchLegalData();
  }, []);

  const openImagePopup = (imageSrc) => {
    setPopupImage(imageSrc);
  };

  const closeImagePopup = () => {
    setPopupImage(null);
  };

  // Toggle section visibility
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">View All Legal Details</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!legalData) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">View All Legal Details</h2>
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No legal data found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding legal information.</p>
          <div className="mt-6">
            <a
              href="/form"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Legal Information
            </a>
          </div>
        </div>
      </div>
    );
  }

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

  // Detail item component
  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start py-2">
      {Icon && <Icon size={16} className="text-gray-400 mt-1 mr-2 flex-shrink-0" />}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mr-4">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Legal Information Overview</h2>
          <p className="text-gray-600">Complete details of your pharmacy's legal documentation</p>
        </div>
      </div>
      
      {/* License Renewal Status Card - Modern Design */}
      {legalData && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mr-4">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">License Renewal</h3>
                <p className="text-sm text-gray-600">
                  {legalData.licenseRenewalDate 
                    ? `Next renewal: ${new Date(legalData.licenseRenewalDate).toLocaleDateString()}` 
                    : "No renewal date set"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                legalData.licenseReminder 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {legalData.licenseReminder ? "Reminder Active" : "Reminder Off"}
              </div>
              
              {legalData.licenseRenewalDate && (
                <div className="ml-4 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {(() => {
                    const today = new Date();
                    const renewalDate = new Date(legalData.licenseRenewalDate);
                    const timeDiff = renewalDate.getTime() - today.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    
                    if (daysDiff < 0) {
                      return "Expired";
                    } else if (daysDiff <= 30) {
                      return `${daysDiff} days left`;
                    } else {
                      return "Active";
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
          
          {legalData.licenseRenewalDate && (
            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="flex items-center text-sm text-gray-600">
                <Shield size={16} className="mr-2 text-blue-500" />
                <span>
                  {(() => {
                    const today = new Date();
                    const renewalDate = new Date(legalData.licenseRenewalDate);
                    const timeDiff = renewalDate.getTime() - today.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    
                    if (daysDiff < 0) {
                      return `License expired ${Math.abs(daysDiff)} days ago`;
                    } else if (daysDiff <= 30) {
                      return `License expires in ${daysDiff} days`;
                    } else {
                      return `License is valid for ${daysDiff} more days`;
                    }
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-8">
        {/* Legal Documents Section - No dropdown */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
          <div className="flex items-start mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 mr-3">
              <FileImage size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Legal Documents & Certificates</h3>
              <p className="text-sm text-gray-600">Medical council registration, pharmacist license, degree certificates, etc.</p>
            </div>
          </div>
          
          {legalData.pharmacyImages && legalData.pharmacyImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {legalData.pharmacyImages.map((imageObj, index) => (
                <div key={index} className="border rounded-lg p-3 bg-white">
                  <div 
                    className="cursor-pointer relative group rounded-lg overflow-hidden mb-2"
                    onClick={() => openImagePopup(imageObj.src)}
                  >
                    <img 
                      src={imageObj.src} 
                      alt={imageObj.title} 
                      className="w-full h-auto object-contain max-h-32"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.innerHTML = '<div class="bg-gray-100 w-full h-32 flex items-center justify-center"><FileImage size={20} class="text-gray-400" /></div>';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all">
                      <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-800 text-center truncate">{imageObj.title}</div>
                  <div className="text-xs text-gray-500 mt-1 text-center">Click to preview</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileImage size={32} className="mx-auto text-gray-300 mb-2" />
              <p>No legal documents uploaded</p>
            </div>
          )}
        </div>

        {/* Business Registration Image - No dropdown */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
          <div className="flex items-start mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 mr-3">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Business Registration</h3>
              <p className="text-sm text-gray-600">Your Business Registration document</p>
            </div>
          </div>
          
          {legalData.businessRegistrationImage ? (
            <div className="max-w-xs mx-auto">
              <div 
                className="cursor-pointer relative group rounded-lg overflow-hidden bg-white"
                onClick={() => openImagePopup(legalData.businessRegistrationImage)}
              >
                <img 
                  src={legalData.businessRegistrationImage} 
                  alt="Business Registration" 
                  className="w-full h-auto object-contain max-h-40"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = '<div class="bg-gray-100 w-full h-40 flex items-center justify-center"><FileImage size={24} class="text-gray-400" /></div>';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-500">Business Registration Document</p>
                <p className="text-xs text-gray-400 mt-1">Click to preview with zoom</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard size={32} className="mx-auto text-gray-300 mb-2" />
              <p>No business registration document uploaded</p>
            </div>
          )}
        </div>

        {/* Pharmacy Details - With dropdown */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
          <DropdownSectionHeader 
            icon={Building2}
            title="Pharmacy Details"
            subtitle="Basic information about your pharmacy business"
            isOpen={openSections.pharmacyDetails}
            onToggle={() => toggleSection('pharmacyDetails')}
          />
          
          {openSections.pharmacyDetails && (
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <DetailItem label="Name" value={legalData.pharmacyName} icon={Building2} />
              <DetailItem label="Address" value={legalData.pharmacyAddress} icon={MapPin} />
              <DetailItem label="Website" value={legalData.pharmacyWebsite} icon={Globe} />
              <DetailItem label="BR Number" value={legalData.brNumber} icon={CreditCard} />
              <DetailItem label="Email" value={legalData.pharmacyEmail} icon={Mail} />
              <DetailItem label="Mobile" value={legalData.pharmacyMobile} icon={Phone} />
              <DetailItem label="Landline" value={legalData.pharmacyLandline} icon={Phone} />
            </div>
          )}
        </div>

        {/* Owner Information - With dropdown */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
          <DropdownSectionHeader 
            icon={User}
            title="Owner Information"
            subtitle="Details of the pharmacy owner"
            isOpen={openSections.ownerInfo}
            onToggle={() => toggleSection('ownerInfo')}
          />
          
          {openSections.ownerInfo && (
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <DetailItem label="Name" value={legalData.ownerName} icon={User} />
              <DetailItem label="NIC" value={legalData.ownerNIC} icon={CreditCard} />
              <DetailItem label="Email" value={legalData.ownerEmail} icon={Mail} />
              <DetailItem label="Phone" value={legalData.ownerPhone} icon={Phone} />
            </div>
          )}
        </div>

        {/* Responsible Pharmacist - With dropdown */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
          <DropdownSectionHeader 
            icon={Award}
            title="Responsible Pharmacist"
            subtitle="Details of the licensed pharmacist in charge"
            isOpen={openSections.pharmacist}
            onToggle={() => toggleSection('pharmacist')}
          />
          
          {openSections.pharmacist && (
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <DetailItem label="Name" value={legalData.pharmacistName} icon={User} />
              <DetailItem label="Registration Number" value={legalData.pharmacistRegNumber} icon={Award} />
            </div>
          )}
        </div>

        {/* License & Renewal - With dropdown */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
          <DropdownSectionHeader 
            icon={Shield}
            title="License & Renewal"
            subtitle="License information and renewal settings"
            isOpen={openSections.license}
            onToggle={() => toggleSection('license')}
          />
          
          {openSections.license && (
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <DetailItem label="Next Renewal Date" value={legalData.licenseRenewalDate} icon={Calendar} />
              <div className="flex items-center py-2">
                <Shield size={16} className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reminder</p>
                  <p className="text-sm font-medium text-gray-900">
                    {legalData.licenseReminder ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Disabled
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Popup */}
      {popupImage && (
        <ImagePopup imageSrc={popupImage} onClose={closeImagePopup} />
      )}
    </div>
  );
};

// Dashboard component
const DashboardPage = () => (
  <div className="bg-white shadow rounded-xl p-6">
    <div className="flex items-center mb-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mr-4">
        <Shield size={24} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Legal Module Dashboard</h2>
        <p className="text-gray-600">Manage all legal documentation for your pharmacy business</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-100">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 text-white mr-3">
            <FileText size={20} />
          </div>
          <h3 className="text-lg font-semibold text-blue-800">Add/Edit Legal Information</h3>
        </div>
        <p className="text-blue-700 mb-4">Upload documents and update pharmacy legal details.</p>
        <ul className="space-y-2 text-blue-600">
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
            Upload pharmacy images
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
            Add business registration
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
            Update pharmacy details
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
            Manage license information
          </li>
        </ul>
        <div className="mt-4">
          <a
            href="/form"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Legal Info
          </a>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-100">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white mr-3">
            <Eye size={20} />
          </div>
          <h3 className="text-lg font-semibold text-green-800">View All Legal Details</h3>
        </div>
        <p className="text-green-700 mb-4">Review all uploaded documents and information.</p>
        <ul className="space-y-2 text-green-600">
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
            View all pharmacy images
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
            Check business registration
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
            Review pharmacy details
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
            Monitor license status
          </li>
        </ul>
        <div className="mt-4">
          <a
            href="/view"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/form" element={<Layout><LegalForm /></Layout>} />
          <Route path="/view" element={<Layout><ViewAllDetails /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;