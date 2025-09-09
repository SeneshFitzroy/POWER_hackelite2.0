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
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Switch,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  CircularProgress,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom colors for the legal module
const COLORS = {
  darkBlue: '#1E3A8A',    // For sidebar and main buttons
  mediumBlue: '#3B82F6',  // For headers and interactive elements
  lightGray: '#f8f9fa',   // For main content background
  darkGray: '#212121',    // For main text
  lighterGray: '#757575'  // For secondary text
};

// Simple image popup for form previews using Material UI Dialog
const ImagePreviewPopup = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  return (
    <Dialog 
      open={!!imageSrc} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Image Preview</Typography>
          <IconButton onClick={onClose}>
            <X />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center">
          <img 
            src={imageSrc} 
            alt="Preview" 
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ backgroundColor: COLORS.darkBlue, color: 'white', '&:hover': { backgroundColor: COLORS.mediumBlue } }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  backgroundColor: COLORS.lightGray, // Light gray background
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: COLORS.lightGray, // Light gray background
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  backgroundColor: COLORS.darkBlue, // Dark blue for buttons
  color: 'white',
  '&:hover': {
    backgroundColor: COLORS.mediumBlue, // Medium blue on hover
  },
}));

const UploadArea = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  border: '2px dashed',
  borderColor: COLORS.mediumBlue, // Medium blue border
  borderRadius: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: COLORS.darkBlue, // Dark blue on hover
    backgroundColor: 'rgba(59, 130, 246, 0.05)', // Light blue background on hover
  },
}));

const LegalForm = () => {
  const [formData, setFormData] = useState({
    // Documentation
    pharmacyImages: [],
    businessRegistrationImage: '',
    
    // Pharmacy Details
    pharmacyName: 'New Pharmacy Kalutara',
    pharmacyAddress: '212 Galle Rd, Kalutara 12000',
    pharmacyWebsite: 'https://lankanumbers.com/business-directory/the-new-pharmacy-kalutara/',
    brNumber: 'BR001234567',
    pharmacyEmail: 'info@newpharmacykalutara.lk',
    pharmacyMobile: '+94 77 123 4567',
    pharmacyLandline: '+94 34 223 4567',
    
    // Owner Information
    ownerName: 'Dr. Samantha Perera',
    ownerNIC: '198567123456',
    ownerEmail: 'samantha.perera@newpharmacykalutara.lk',
    ownerPhone: '+94 77 987 6543',
    
    // Responsible Pharmacist
    pharmacistName: 'Dr. Nimal Fernando',
    pharmacistRegNumber: 'PHARM/2023/001234',
    
    // License & Renewal
    licenseRenewalDate: '2025-12-31',
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
    <SectionHeader onClick={onToggle}>
      <Box display="flex" alignItems="center">
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: 1, 
            backgroundColor: COLORS.mediumBlue, // Medium blue background
            color: 'white',
            mr: 2 
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
      <Box sx={{ color: COLORS.lighterGray }}>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Box>
    </SectionHeader>
  );

  // Masked input component for sensitive information
  const MaskedInput = ({ label, name, value, onChange, icon: Icon }) => {
    const [showFull, setShowFull] = useState(false);
    
    const maskedValue = showFull 
      ? value 
      : value.length > 4 
        ? `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`
        : '*'.repeat(value.length);
    
    return (
      <FormControl fullWidth sx={{ mb: 2 }}>
        <FormLabel sx={{ mb: 1, fontWeight: 'medium', color: COLORS.darkGray }}>
          {label}
        </FormLabel>
        <OutlinedInput
          name={name}
          value={value ? maskedValue : ''}
          onChange={onChange}
          startAdornment={
            Icon && (
              <InputAdornment position="start">
                <Icon size={18} />
              </InputAdornment>
            )
          }
          endAdornment={
            value && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowFull(!showFull)}
                  edge="end"
                  size="small"
                >
                  {showFull ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              </InputAdornment>
            )
          }
          placeholder={`Enter ${label.toLowerCase()}`}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: COLORS.mediumBlue, // Medium blue border
              },
              '&:hover fieldset': {
                borderColor: COLORS.darkBlue, // Dark blue on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: COLORS.darkBlue, // Dark blue when focused
              },
            },
          }}
        />
      </FormControl>
    );
  };

  // Styled input component
  const StyledInput = ({ label, icon: Icon, ...props }) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <FormLabel sx={{ mb: 1, fontWeight: 'medium', color: COLORS.darkGray }}>
        {label}
      </FormLabel>
      <OutlinedInput
        {...props}
        startAdornment={
          Icon && (
            <InputAdornment position="start">
              <Icon size={18} />
            </InputAdornment>
          )
        }
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: COLORS.mediumBlue, // Medium blue border
            },
            '&:hover fieldset': {
              borderColor: COLORS.darkBlue, // Dark blue on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.darkBlue, // Dark blue when focused
            },
          },
        }}
      />
    </FormControl>
  );

  // Styled textarea component
  const StyledTextarea = ({ label, icon: Icon, ...props }) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <FormLabel sx={{ mb: 1, fontWeight: 'medium', color: COLORS.darkGray }}>
        {label}
      </FormLabel>
      <TextField
        {...props}
        multiline
        minRows={3}
        maxRows={6}
        InputProps={{
          startAdornment: Icon && (
            <InputAdornment position="start" sx={{ mt: -2 }}>
              <Icon size={18} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: COLORS.mediumBlue, // Medium blue border
            },
            '&:hover fieldset': {
              borderColor: COLORS.darkBlue, // Dark blue on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.darkBlue, // Dark blue when focused
            },
          },
        }}
      />
    </FormControl>
  );

  return (
    <Container maxWidth={false} className="legal-form-container">
      <StyledCard className="legal-form-card">
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 3 }} className="section-header">
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              sx={{ 
                width: 56, 
                height: 56, 
                borderRadius: 2, 
                backgroundColor: COLORS.mediumBlue, // Medium blue for header icon
                color: 'white',
                mr: 2 
              }}
            >
              <FileImage size={28} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.darkGray }}>
                Legal Documentation
              </Typography>
              <Typography variant="body1" sx={{ color: COLORS.lighterGray }}>
                Manage all legal documents and information for your pharmacy
              </Typography>
            </Box>
          </Box>
          
          <form onSubmit={handleSubmit}>
            {/* Documentation Section - No dropdown */}
            <StyledCard variant="outlined" className="legal-form-card">
              <CardContent>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }} className="section-header">
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 1.5, 
                      backgroundColor: COLORS.mediumBlue, // Medium blue background
                      color: 'white',
                      mr: 2 
                    }}
                  >
                    <FileImage size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLORS.darkGray }}>
                      Documentation
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.lighterGray }}>
                      Upload required legal documents and certificates
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2} className="legal-form-grid">
                  {/* Legal Documents Upload */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.darkGray }}>
                      <FileImage size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                      Legal Documents & Certificates
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.lighterGray, mb: 2 }}>
                      Upload medical council registration, pharmacist license, degree certificates, etc.
                    </Typography>
                    
                    <UploadArea 
                      variant="outlined"
                      onClick={() => document.getElementById('pharmacyImages').click()}
                    >
                      <input
                        id="pharmacyImages"
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e, 'pharmacyImages', true)}
                      />
                      <Upload size={48} style={{ color: COLORS.mediumBlue, marginBottom: 16 }} />
                      <Typography variant="body1" sx={{ mb: 1, color: COLORS.darkGray }}>
                        <span style={{ color: COLORS.mediumBlue, fontWeight: 'bold', cursor: 'pointer' }}>
                          Upload files
                        </span>{' '}
                        or drag and drop
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.lighterGray }}>
                        PNG, JPG, PDF up to 10MB
                      </Typography>
                    </UploadArea>
                    
                    {/* Preview of uploaded images */}
                    {formData.pharmacyImages.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: COLORS.darkGray }}>
                          Uploaded Documents ({formData.pharmacyImages.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {formData.pharmacyImages.map((imageObj, index) => (
                            <Paper key={imageObj.id} variant="outlined" sx={{ p: 2 }}>
                              <Box display="flex" alignItems="flex-start">
                                <Box 
                                  sx={{ 
                                    mr: 2, 
                                    cursor: 'pointer',
                                    flexShrink: 0
                                  }}
                                  onClick={() => openImagePopup(imageObj.src)}
                                >
                                  <Box 
                                    sx={{ 
                                      width: 64, 
                                      height: 64, 
                                      backgroundColor: 'grey.200',
                                      border: '2px dashed',
                                      borderColor: COLORS.mediumBlue, // Medium blue border
                                      borderRadius: 1.5,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <FileImage size={24} style={{ color: COLORS.mediumBlue }} />
                                  </Box>
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                  {editingTitleIndex === index ? (
                                    <Box display="flex" alignItems="center">
                                      <TextField
                                        value={titleInput}
                                        onChange={(e) => setTitleInput(e.target.value)}
                                        size="small"
                                        sx={{ mr: 1, flexGrow: 1 }}
                                        autoFocus
                                        InputProps={{
                                          sx: {
                                            '& .MuiOutlinedInput-root': {
                                              '& fieldset': {
                                                borderColor: COLORS.mediumBlue, // Medium blue border
                                              },
                                              '&:hover fieldset': {
                                                borderColor: COLORS.darkBlue, // Dark blue on hover
                                              },
                                              '&.Mui-focused fieldset': {
                                                borderColor: COLORS.darkBlue, // Dark blue when focused
                                              },
                                            },
                                          }}
                                        }
                                      />
                                      <IconButton 
                                        onClick={() => saveTitle(index)}
                                        sx={{ backgroundColor: COLORS.darkBlue, color: 'white', '&:hover': { backgroundColor: COLORS.mediumBlue } }}
                                        size="small"
                                      >
                                        <Save size={16} />
                                      </IconButton>
                                      <IconButton 
                                        onClick={cancelEditing}
                                        sx={{ backgroundColor: COLORS.lighterGray, color: 'white', '&:hover': { backgroundColor: COLORS.darkGray }, ml: 1 }}
                                        size="small"
                                      >
                                        <X size={16} />
                                      </IconButton>
                                    </Box>
                                  ) : (
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: COLORS.darkGray }}>
                                        {imageObj.title}
                                      </Typography>
                                      <IconButton 
                                        onClick={() => startEditingTitle(index, imageObj.title)}
                                        sx={{ color: COLORS.mediumBlue, '&:hover': { color: COLORS.darkBlue } }}
                                        size="small"
                                      >
                                        <Edit3 size={16} />
                                      </IconButton>
                                    </Box>
                                  )}
                                  <Typography variant="caption" sx={{ color: COLORS.lighterGray }}>
                                    Click image to preview
                                  </Typography>
                                </Box>
                                <IconButton 
                                  onClick={() => removePharmacyImage(index)}
                                  sx={{ color: '#f44336', '&:hover': { color: '#d32f2f' } }}
                                  size="small"
                                >
                                  <X size={20} />
                                </IconButton>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Grid>
                  
                  {/* BR Image Upload */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.darkGray }}>
                      <CreditCard size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                      Business Registration
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.lighterGray, mb: 2 }}>
                      Upload your Business Registration document
                    </Typography>
                    
                    <UploadArea 
                      variant="outlined"
                      onClick={() => document.getElementById('businessRegistrationImage').click()}
                    >
                      <input
                        id="businessRegistrationImage"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e, 'businessRegistrationImage')}
                      />
                      <Upload size={48} style={{ color: COLORS.mediumBlue, marginBottom: 16 }} />
                      <Typography variant="body1" sx={{ mb: 1, color: COLORS.darkGray }}>
                        <span style={{ color: COLORS.mediumBlue, fontWeight: 'bold', cursor: 'pointer' }}>
                          Upload file
                        </span>{' '}
                        or drag and drop
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.lighterGray }}>
                        PNG, JPG, PDF up to 10MB
                      </Typography>
                    </UploadArea>
                    
                    {/* Preview of BR image */}
                    {formData.businessRegistrationImage && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: COLORS.darkGray }}>
                          Document Preview
                        </Typography>
                        <Box 
                          sx={{ 
                            border: '1px solid',
                            borderColor: COLORS.mediumBlue, // Medium blue border
                            borderRadius: 2,
                            p: 1,
                            backgroundColor: 'grey.50',
                            cursor: 'pointer',
                            position: 'relative',
                            '&:hover': {
                              backgroundColor: 'grey.100'
                            }
                          }}
                          onClick={() => openImagePopup(formData.businessRegistrationImage)}
                        >
                          <Box 
                            sx={{ 
                              width: '100%', 
                              height: 128, 
                              backgroundColor: 'grey.200',
                              border: '2px dashed',
                              borderColor: COLORS.mediumBlue, // Medium blue border
                              borderRadius: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FileImage size={32} style={{ color: COLORS.mediumBlue }} />
                          </Box>
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
                        <Typography variant="caption" sx={{ color: COLORS.lighterGray, display: 'block', textAlign: 'center', mt: 1 }}>
                          Click to preview
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>

                {/* Image Preview Gallery Section */}
                {(formData.pharmacyImages.length > 0 || formData.businessRegistrationImage) && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: COLORS.mediumBlue }} className="image-preview-gallery">
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }} className="section-header">
                      <Camera size={20} style={{ color: COLORS.mediumBlue, marginRight: 8 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray }}>
                        Image Preview Gallery
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {/* Preview for Business Registration Image */}
                      {formData.businessRegistrationImage && (
                        <Grid item xs={6} sm={4} md={3}>
                          <Box 
                            sx={{ 
                              border: '1px solid',
                              borderColor: COLORS.mediumBlue, // Medium blue border
                              borderRadius: 2,
                              p: 1,
                              backgroundColor: 'grey.50',
                              cursor: 'pointer',
                              position: 'relative',
                              height: '100%',
                              '&:hover': {
                                backgroundColor: 'grey.100'
                              }
                            }}
                            onClick={() => openImagePopup(formData.businessRegistrationImage)}
                          >
                            <Box 
                              sx={{ 
                                width: '100%', 
                                height: 128, 
                                backgroundColor: 'grey.200',
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}
                            >
                              <img 
                                src={formData.businessRegistrationImage} 
                                alt="Business Registration" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background-color:#eee;display:flex;align-items:center;justify-content:center;"><FileImage size={24} style="color:' + COLORS.mediumBlue + '" /></div>';
                                }}
                              />
                            </Box>
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
                            <Typography variant="caption" sx={{ color: COLORS.lighterGray, display: 'block', textAlign: 'center', mt: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              BR Document
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {/* Preview for Pharmacy Images */}
                      {formData.pharmacyImages.map((imageObj, index) => (
                        <Grid key={`preview-${imageObj.id}`} item xs={6} sm={4} md={3}>
                          <Box 
                            sx={{ 
                              border: '1px solid',
                              borderColor: COLORS.mediumBlue, // Medium blue border
                              borderRadius: 2,
                              p: 1,
                              backgroundColor: 'grey.50',
                              cursor: 'pointer',
                              position: 'relative',
                              height: '100%',
                              '&:hover': {
                                backgroundColor: 'grey.100'
                              }
                            }}
                            onClick={() => openImagePopup(imageObj.src)}
                          >
                            <Box 
                              sx={{ 
                                width: '100%', 
                                height: 128, 
                                backgroundColor: 'grey.200',
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}
                            >
                              <img 
                                src={imageObj.src} 
                                alt={imageObj.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background-color:#eee;display:flex;align-items:center;justify-content:center;"><FileImage size={24} style="color:' + COLORS.mediumBlue + '" /></div>';
                                }}
                              />
                            </Box>
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
                            <Typography variant="caption" sx={{ color: COLORS.lighterGray, display: 'block', textAlign: 'center', mt: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {imageObj.title}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Typography variant="caption" sx={{ color: COLORS.lighterGray, display: 'block', textAlign: 'center', mt: 2 }}>
                      Click on any image to view full size
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
            
            {/* Pharmacy Details Section - With dropdown */}
            <StyledCard variant="outlined">
              <CardContent>
                <DropdownSectionHeader 
                  icon={Building2}
                  title="Pharmacy Details"
                  subtitle="Basic information about your pharmacy business"
                  isOpen={openSections.pharmacyDetails}
                  onToggle={() => toggleSection('pharmacyDetails')}
                />
                
                <Collapse in={openSections.pharmacyDetails}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: 'white' }}>
                    <Grid container spacing={2} className="legal-form-grid">
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Pharmacy Name"
                          name="pharmacyName"
                          value={formData.pharmacyName}
                          onChange={handleInputChange}
                          icon={Building2}
                          placeholder="Enter pharmacy name"
                          className="form-input"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <StyledTextarea
                          label="Address"
                          name="pharmacyAddress"
                          value={formData.pharmacyAddress}
                          onChange={handleInputChange}
                          icon={MapPin}
                          placeholder="Enter full address"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Website/Directory Link"
                          name="pharmacyWebsite"
                          value={formData.pharmacyWebsite}
                          onChange={handleInputChange}
                          icon={Globe}
                          placeholder="https://example.com"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <MaskedInput
                          label="BR Number"
                          name="brNumber"
                          value={formData.brNumber}
                          onChange={handleInputChange}
                          icon={CreditCard}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Email"
                          name="pharmacyEmail"
                          type="email"
                          value={formData.pharmacyEmail}
                          onChange={handleInputChange}
                          icon={Mail}
                          placeholder="pharmacy@example.com"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Mobile Number"
                          name="pharmacyMobile"
                          value={formData.pharmacyMobile}
                          onChange={handleInputChange}
                          icon={Phone}
                          placeholder="+94 7X XXX XXXX"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Landline Number"
                          name="pharmacyLandline"
                          value={formData.pharmacyLandline}
                          onChange={handleInputChange}
                          icon={Phone}
                          placeholder="+94 XX XXX XXXX"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Collapse>
              </CardContent>
            </StyledCard>
            
            {/* Owner Information Section - With dropdown */}
            <StyledCard variant="outlined">
              <CardContent>
                <DropdownSectionHeader 
                  icon={User}
                  title="Owner Information"
                  subtitle="Details of the pharmacy owner"
                  isOpen={openSections.ownerInfo}
                  onToggle={() => toggleSection('ownerInfo')}
                />
                
                <Collapse in={openSections.ownerInfo}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: 'white' }}>
                    <Grid container spacing={2} className="legal-form-grid">
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Owner Name"
                          name="ownerName"
                          value={formData.ownerName}
                          onChange={handleInputChange}
                          icon={UserCircle}
                          placeholder="Enter owner's full name"
                          className="form-input"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <MaskedInput
                          label="NIC"
                          name="ownerNIC"
                          value={formData.ownerNIC}
                          onChange={handleInputChange}
                          icon={CreditCard}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Email"
                          name="ownerEmail"
                          type="email"
                          value={formData.ownerEmail}
                          onChange={handleInputChange}
                          icon={Mail}
                          placeholder="owner@example.com"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Phone Number"
                          name="ownerPhone"
                          value={formData.ownerPhone}
                          onChange={handleInputChange}
                          icon={Phone}
                          placeholder="+94 7X XXX XXXX"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Collapse>
              </CardContent>
            </StyledCard>
            
            {/* Responsible Pharmacist Section - With dropdown */}
            <StyledCard variant="outlined">
              <CardContent>
                <DropdownSectionHeader 
                  icon={Award}
                  title="Responsible Pharmacist"
                  subtitle="Details of the licensed pharmacist in charge"
                  isOpen={openSections.pharmacist}
                  onToggle={() => toggleSection('pharmacist')}
                />
                
                <Collapse in={openSections.pharmacist}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: 'white' }}>
                    <Grid container spacing={2} className="legal-form-grid">
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Pharmacist Name"
                          name="pharmacistName"
                          value={formData.pharmacistName}
                          onChange={handleInputChange}
                          icon={User}
                          placeholder="Enter pharmacist's full name"
                          className="form-input"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <MaskedInput
                          label="Registration Number"
                          name="pharmacistRegNumber"
                          value={formData.pharmacistRegNumber}
                          onChange={handleInputChange}
                          icon={Award}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Collapse>
              </CardContent>
            </StyledCard>
            
            {/* License & Renewal Section - With dropdown */}
            <StyledCard variant="outlined">
              <CardContent>
                <DropdownSectionHeader 
                  icon={Shield}
                  title="License & Renewal"
                  subtitle="License information and renewal settings"
                  isOpen={openSections.license}
                  onToggle={() => toggleSection('license')}
                />
                
                <Collapse in={openSections.license}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: 'white' }}>
                    <Grid container spacing={2} className="legal-form-grid">
                      <Grid item xs={12} md={6}>
                        <StyledInput
                          label="Next License Renewal Date"
                          name="licenseRenewalDate"
                          type="date"
                          value={formData.licenseRenewalDate}
                          onChange={handleInputChange}
                          icon={Calendar}
                          className="form-input"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            backgroundColor: 'grey.50',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Switch
                                  name="licenseReminder"
                                  checked={formData.licenseReminder}
                                  onChange={handleInputChange}
                                  color="primary"
                                />
                              }
                              label={
                                <Box display="flex" alignItems="center">
                                  <Bell size={16} style={{ marginRight: 8, color: COLORS.mediumBlue }} />
                                  <Typography variant="body1" sx={{ color: COLORS.darkGray }}>
                                    Notify before expiry
                                  </Typography>
                                </Box>
                              }
                            />
                          </FormGroup>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Paper>
                </Collapse>
              </CardContent>
            </StyledCard>
            
            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Save />}
              >
                {loading ? 'Saving...' : 'Save Legal Details'}
              </StyledButton>
            </Box>
          </form>
        </CardContent>
      </StyledCard>
      
      {/* Image Popup */}
      {popupImage && (
        <ImagePreviewPopup imageSrc={popupImage} onClose={closeImagePopup} />
      )}
    </Container>
  );
};

export default LegalForm;