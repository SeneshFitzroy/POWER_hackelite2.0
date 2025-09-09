import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LegalForm from './components/LegalForm';
import Regulations from './components/Regulations';
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
  EyeOff,
  FileImage,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Switch,
  Typography,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import './index.css';

// Custom colors for the legal module
const COLORS = {
  darkBlue: '#1E3A8A',    // For sidebar and main buttons
  mediumBlue: '#3B82F6',  // For headers and interactive elements
  lightGray: '#f8f9fa',   // For main content background
  darkGray: '#212121',    // For main text
  lighterGray: '#757575'  // For secondary text
};

// Image popup component with zoom functionality using Material UI Dialog
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
    <Dialog 
      open={!!imageSrc} 
      onClose={onClose}
      maxWidth={false}
      fullWidth
      fullScreen
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Document Preview</Typography>
          <Box>
            <IconButton onClick={handleZoomIn} sx={{ color: COLORS.mediumBlue, '&:hover': { color: COLORS.darkBlue } }}>
              <Plus />
            </IconButton>
            <IconButton onClick={handleZoomOut} sx={{ color: COLORS.mediumBlue, '&:hover': { color: COLORS.darkBlue } }}>
              <Minus />
            </IconButton>
            <IconButton onClick={handleRotate} sx={{ color: COLORS.mediumBlue, '&:hover': { color: COLORS.darkBlue } }}>
              <RotateCw />
            </IconButton>
            <IconButton onClick={resetView} sx={{ color: COLORS.mediumBlue, '&:hover': { color: COLORS.darkBlue } }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </IconButton>
            <IconButton onClick={onClose} sx={{ color: '#f44336', '&:hover': { color: '#d32f2f' } }}>
              <X />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 0,
          position: 'relative',
          overflow: 'hidden'
        }}
        onWheel={handleWheel}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={imageSrc}
            alt="Document"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center',
              cursor: isDragging ? 'grabbing' : 'grab',
              transition: isDragging ? 'none' : 'transform 0.2s ease',
              maxWidth: 'none',
            }}
            onMouseDown={handleMouseDown}
          />
        </Box>
        
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2
          }}
        >
          <Typography variant="caption">
            Zoom: {Math.round(scale * 100)}%
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
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
      <Card sx={{ backgroundColor: COLORS.lightGray }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: COLORS.darkGray }}>
            View All Legal Details
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 200 }}>
            <CircularProgress sx={{ color: COLORS.mediumBlue }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!legalData) {
    return (
      <Card sx={{ backgroundColor: COLORS.lightGray }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: COLORS.darkGray }}>
            View All Legal Details
          </Typography>
          <Box textAlign="center" sx={{ py: 8 }}>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                backgroundColor: 'grey.100',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <FileText style={{ color: COLORS.mediumBlue }} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1, color: COLORS.darkGray }}>
              No legal data found
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.lighterGray, mb: 3 }}>
              Get started by adding legal information.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ backgroundColor: COLORS.darkBlue, color: 'white', '&:hover': { backgroundColor: COLORS.mediumBlue } }}
              href="/form"
            >
              Add Legal Information
            </Button>
          </Box>
        </CardContent>
      </Card>
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
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        backgroundColor: COLORS.lightGray,
        borderRadius: 1,
        mb: 2,
        cursor: 'pointer'
      }}
      onClick={onToggle}
    >
      <Box display="flex" alignItems="center">
        <Box 
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: 1, 
            backgroundColor: COLORS.mediumBlue, 
            color: 'white',
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={20} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: COLORS.lighterGray }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ color: COLORS.lighterGray, ml: 'auto' }}>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Box>
    </Box>
  );

  // Detail item component
  const DetailItem = ({ label, value, icon: Icon }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
      {Icon && <Icon size={16} style={{ color: COLORS.mediumBlue, marginTop: 4, marginRight: 8, flexShrink: 0 }} />}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 'medium', color: COLORS.lighterGray, textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'medium', color: COLORS.darkGray }}>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  // Masked detail item component for sensitive information
  const MaskedDetailItem = ({ label, value, icon: Icon }) => {
    const [showFull, setShowFull] = useState(false);
    
    if (!value) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
          {Icon && <Icon size={16} style={{ color: COLORS.mediumBlue, marginTop: 4, marginRight: 8, flexShrink: 0 }} />}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 'medium', color: COLORS.lighterGray, textTransform: 'uppercase' }}>
              {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: COLORS.darkGray }}>
              N/A
            </Typography>
          </Box>
        </Box>
      );
    }
    
    const maskedValue = showFull 
      ? value 
      : value.length > 4 
        ? `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`
        : '*'.repeat(value.length);
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
        {Icon && <Icon size={16} style={{ color: COLORS.mediumBlue, marginTop: 4, marginRight: 8, flexShrink: 0 }} />}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 'medium', color: COLORS.lighterGray, textTransform: 'uppercase' }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: COLORS.darkGray, mr: 1 }}>
              {maskedValue}
            </Typography>
            <IconButton 
              onClick={() => setShowFull(!showFull)}
              size="small"
              sx={{ p: 0.5, color: COLORS.mediumBlue, '&:hover': { color: COLORS.darkBlue } }}
            >
              {showFull ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ backgroundColor: COLORS.lightGray, minHeight: '100vh', width: '100%', margin: 0, padding: 0 }} className="legal-form-card">
      <Box sx={{ width: '100%', pl: 2, pr: 3, py: 3, margin: 0 }}>
        
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'left', width: '100%' }} className="section-header">
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 1, textAlign: 'left' }}>
            Legal Information Overview
          </Typography>
          <Typography variant="body1" sx={{ color: COLORS.lighterGray, textAlign: 'left' }}>
            Complete details of your pharmacy's legal documentation
          </Typography>
        </Box>
        
        {/* License Renewal Status Card - Modern Design */}
        {legalData && (
          <Paper 
            sx={{ 
              mb: 4, 
              p: 3, 
              backgroundColor: 'white',
              borderRadius: 2,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            elevation={0}
            className="legal-form-card"
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 1, 
                    backgroundColor: COLORS.mediumBlue, 
                    color: 'white',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Calendar size={24} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray }}>
                    License Renewal
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.lighterGray }}>
                    {legalData.licenseRenewalDate 
                      ? `Next renewal: ${new Date(legalData.licenseRenewalDate).toLocaleDateString()}` 
                      : "No renewal date set"}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  label={legalData.licenseReminder ? "Reminder Active" : "Reminder Off"}
                  color={legalData.licenseReminder ? "success" : "warning"}
                  size="small"
                  sx={{ fontWeight: 'medium' }}
                />
                
                {legalData.licenseRenewalDate && (
                  <Chip 
                    label={(() => {
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
                    color={(() => {
                      const today = new Date();
                      const renewalDate = new Date(legalData.licenseRenewalDate);
                      const timeDiff = renewalDate.getTime() - today.getTime();
                      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                      
                      if (daysDiff < 0) {
                        return "error";
                      } else if (daysDiff <= 30) {
                        return "warning";
                      } else {
                        return "info";
                      }
                    })()}
                    size="small"
                    sx={{ ml: 2, fontWeight: 'medium' }}
                  />
                )}
              </Box>
            </Box>
            
            {legalData.licenseRenewalDate && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: COLORS.mediumBlue }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Shield size={16} style={{ color: COLORS.mediumBlue, marginRight: 8 }} />
                  <Typography variant="body2" sx={{ color: COLORS.lighterGray }}>
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
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        )}
        
        {/* Legal Documents Section */}
        <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', mb: 4, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 1 }}>
              Legal Documents & Certificates
            </Typography>
            <Typography variant="body1" sx={{ color: COLORS.lighterGray }}>
              Medical council registration, pharmacist license, degree certificates, etc.
            </Typography>
          </Box>
          
          {legalData.pharmacyImages && legalData.pharmacyImages.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start' }}>
              {legalData.pharmacyImages.map((imageObj, index) => (
                <Box key={index} sx={{ width: { xs: '100%', sm: '300px', md: '280px' } }}>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fafafa', border: '1px solid #e0e0e0' }}>
                    <Box 
                      sx={{ 
                        cursor: 'pointer', 
                        position: 'relative', 
                        mb: 2,
                        borderRadius: 1,
                        overflow: 'hidden',
                        backgroundColor: 'white'
                      }}
                      onClick={() => openImagePopup(imageObj.src)}
                    >
                      <img 
                        src={imageObj.src} 
                        alt={imageObj.title} 
                        style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.innerHTML = '<div style="width:100%;height:160px;background-color:#eee;display:flex;align-items:center;justify-content:center;border-radius:4px;"><span style="color:' + COLORS.mediumBlue + ';">Document Preview</span></div>';
                        }}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0)',
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        <ZoomIn size={20} style={{ color: 'white', opacity: 0, transition: 'opacity 0.2s' }} />
                      </Box>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: COLORS.darkGray, mb: 0.5, textAlign: 'left' }}>
                      {imageObj.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.lighterGray, textAlign: 'left' }}>
                      Click to preview
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: 'left', color: COLORS.lighterGray }}>
              <Typography variant="body1" sx={{ color: COLORS.darkGray }}>
                No legal documents uploaded
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Business Registration Section */}
        <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', mb: 4, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 1 }}>
              Business Registration
            </Typography>
            <Typography variant="body1" sx={{ color: COLORS.lighterGray }}>
              Your Business Registration document
            </Typography>
          </Box>
          
          {legalData.businessRegistrationImage ? (
            <Box sx={{ maxWidth: 400, textAlign: 'left' }}>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fafafa' }}>
                <Box 
                  sx={{ 
                    cursor: 'pointer', 
                    position: 'relative', 
                    borderRadius: 1,
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    mb: 2
                  }}
                  onClick={() => openImagePopup(legalData.businessRegistrationImage)}
                >
                  <img 
                    src={legalData.businessRegistrationImage} 
                    alt="Business Registration" 
                    style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = '<div style="width:100%;height:200px;background-color:#eee;display:flex;align-items:center;justify-content:center;border-radius:4px;"><span style="color:' + COLORS.mediumBlue + ';">Business Registration Preview</span></div>';
                    }}
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <ZoomIn size={24} style={{ color: 'white', opacity: 0, transition: 'opacity 0.2s' }} />
                  </Box>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: COLORS.darkGray, mb: 0.5, textAlign: 'left' }}>
                  Business Registration Document
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.lighterGray, textAlign: 'left' }}>
                  Click to preview with zoom
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: 'left', color: COLORS.lighterGray }}>
              <Typography variant="body1" sx={{ color: COLORS.darkGray }}>
                No business registration document uploaded
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Pharmacy Information Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
          {/* Pharmacy Details */}
          <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 3 }}>
              Pharmacy Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DetailItem label="Name" value={legalData.pharmacyName} icon={Building2} />
              <DetailItem label="Address" value={legalData.pharmacyAddress} icon={MapPin} />
              <DetailItem label="Website" value={legalData.pharmacyWebsite} icon={Globe} />
              <MaskedDetailItem label="BR Number" value={legalData.brNumber} icon={CreditCard} />
              <DetailItem label="Email" value={legalData.pharmacyEmail} icon={Mail} />
              <DetailItem label="Mobile" value={legalData.pharmacyMobile} icon={Phone} />
              <DetailItem label="Landline" value={legalData.pharmacyLandline} icon={Phone} />
            </Box>
          </Paper>

          {/* Owner Information */}
          <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 3 }}>
              Owner Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DetailItem label="Name" value={legalData.ownerName} icon={User} />
              <MaskedDetailItem label="NIC" value={legalData.ownerNIC} icon={CreditCard} />
              <DetailItem label="Email" value={legalData.ownerEmail} icon={Mail} />
              <DetailItem label="Phone" value={legalData.ownerPhone} icon={Phone} />
            </Box>
          </Paper>
        </Box>

        {/* Additional Information Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
          {/* Responsible Pharmacist */}
          <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 3 }}>
              Responsible Pharmacist
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DetailItem label="Name" value={legalData.pharmacistName} icon={User} />
              <MaskedDetailItem label="Registration Number" value={legalData.pharmacistRegNumber} icon={Award} />
            </Box>
          </Paper>

          {/* License & Renewal */}
          <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 3 }}>
              License & Renewal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DetailItem label="Next Renewal Date" value={legalData.licenseRenewalDate} icon={Calendar} />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
                <Shield size={16} style={{ color: COLORS.mediumBlue, marginTop: 4, marginRight: 8, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 'medium', color: COLORS.lighterGray, textTransform: 'uppercase' }}>
                    Reminder Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {legalData.licenseReminder ? (
                      <Chip 
                        label="Active" 
                        color="success" 
                        size="small" 
                        sx={{ fontWeight: 'medium' }}
                      />
                    ) : (
                      <Chip 
                        label="Inactive" 
                        color="error" 
                        size="small" 
                        sx={{ fontWeight: 'medium' }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Image Popup */}
        {popupImage && (
          <ImagePopup imageSrc={popupImage} onClose={closeImagePopup} />
        )}
      </Box>
    </Box>
  );
};

// Dashboard component - VIEW ONLY for regular users
const DashboardPage = () => (
  <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, backgroundColor: COLORS.lightGray }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
      <Box 
        sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: 3, 
          backgroundColor: COLORS.mediumBlue, 
          color: 'white',
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Shield size={24} />
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLORS.darkGray }}>
          Legal Information Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.lighterGray }}>
          View pharmacy legal documentation and compliance information
        </Typography>
      </Box>
    </Box>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card 
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            background: 'linear-gradient(to bottom right, #e3f2fd, #bbdefb)',
            border: '1px solid',
            borderColor: COLORS.mediumBlue
          }}
          elevation={0}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                backgroundColor: COLORS.darkBlue, 
                color: 'white',
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Shield size={20} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray }}>
              Legal Information Status
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: COLORS.lighterGray, mb: 3 }}>
            Current status of your pharmacy's legal documentation.
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 3 }}>
            <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', mr: 1.5 }} />
              <Typography variant="body2" sx={{ color: COLORS.darkGray }}>
                License valid until 2025-12-31
              </Typography>
            </Box>
            <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', mr: 1.5 }} />
              <Typography variant="body2" sx={{ color: COLORS.darkGray }}>
                All documents uploaded
              </Typography>
            </Box>
            <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', mr: 1.5 }} />
              <Typography variant="body2" sx={{ color: COLORS.darkGray }}>
                Business registration current
              </Typography>
            </Box>
            <Box component="li" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b', mr: 1.5 }} />
              <Typography variant="body2" sx={{ color: COLORS.darkGray }}>
                Renewal reminder active
              </Typography>
            </Box>
          </Box>
          <Chip 
            label="Compliant" 
            color="success" 
            sx={{ fontWeight: 'bold' }}
          />
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card 
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            background: 'linear-gradient(to bottom right, #e8f5e9, #c8e6c9)',
            border: '1px solid',
            borderColor: '#4caf50'
          }}
          elevation={0}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                backgroundColor: '#4caf50', 
                color: 'white',
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Eye size={20} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray }}>
              View All Legal Details
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: COLORS.lighterGray, mb: 3 }}>
            Review all uploaded documents and information.
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 3 }}>
            <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4caf50', mr: 1.5 }} />
              <Typography variant="body2" sx={{ color: COLORS.darkGray }}>
                View all pharmacy images
              </Typography>
            </Box>
            <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4caf50', mr: 1.5 }} />
              <Typography variant="body2" sx={{ color: COLORS.darkGray }}>
                Check business registration
              </Typography>
            </Box>
            <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4caf50', mr: 1.5 }} />
              <Typography variant="body2" sx={{ color: COLORS.darkGray }}>
                Review pharmacy details
              </Typography>
            </Box>
            <Box component="li" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4caf50', mr: 1.5 }} />
              <Typography variant="body2" sx={{ color: COLORS.darkGray }}>
                Monitor license status
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'medium',
              backgroundColor: '#4caf50',
              color: 'white',
              '&:hover': {
                backgroundColor: '#43a047'
              }
            }}
            href="/view"
          >
            View Details
          </Button>
        </Card>
      </Grid>
    </Grid>
  </Card>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout><ViewAllDetails /></Layout>} />
          <Route path="/view" element={<Layout><ViewAllDetails /></Layout>} />
          <Route path="/regulations" element={<Layout><Regulations /></Layout>} />
          <Route path="/admin" element={<Layout><LegalForm /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;