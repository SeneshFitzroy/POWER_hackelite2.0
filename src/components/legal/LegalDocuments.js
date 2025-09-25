import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Paper,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ZoomIn,
  Business,
  Person,
  CalendarToday,
  Shield,
  Description,
  Place as MapPin,
  Language,
  Phone,
  Email,
  CreditCard,
  Visibility,
  VisibilityOff,
  Close
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const LegalDocuments = () => {
  const theme = useTheme();
  const [legalData, setLegalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupImage, setPopupImage] = useState(null);
  const [showFullNIC, setShowFullNIC] = useState(false);
  const [showFullBR, setShowFullBR] = useState(false);
  const [showFullReg, setShowFullReg] = useState(false);

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

  const maskSensitiveData = (value, showFull) => {
    if (!value) return 'N/A';
    if (showFull) return value;
    return value.length > 4 
      ? `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`
      : '*'.repeat(value.length);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!legalData) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Box 
          sx={{ 
            width: 64, 
            height: 64, 
            backgroundColor: 'grey.100',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}
        >
          <Description sx={{ color: '#3B82F6', fontSize: 32 }} />
        </Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          No Legal Data Found
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Legal information has not been added yet.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#1E3A8A',
            '&:hover': { backgroundColor: '#3B82F6' }
          }}
        >
          Add Legal Information
        </Button>
      </Box>
    );
  }

  // License renewal status component
  const LicenseRenewalStatus = () => {
    if (!legalData.licenseRenewalDate) return null;
    
    const today = new Date();
    const renewalDate = new Date(legalData.licenseRenewalDate);
    const timeDiff = renewalDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let statusColor, statusText, chipColor;
    
    if (daysDiff < 0) {
      statusColor = '#dc2626'; // red
      statusText = `License expired ${Math.abs(daysDiff)} days ago`;
      chipColor = 'error';
    } else if (daysDiff <= 30) {
      statusColor = '#f59e0b'; // amber
      statusText = `License expires in ${daysDiff} days`;
      chipColor = 'warning';
    } else {
      statusColor = '#10b981'; // green
      statusText = `License is valid for ${daysDiff} more days`;
      chipColor = 'success';
    }

    return (
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
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 1, 
                backgroundColor: statusColor, 
                color: 'white',
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CalendarToday />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121' }}>
                License Renewal
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575' }}>
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
            
            <Chip 
              label={daysDiff < 0 ? "Expired" : daysDiff <= 30 ? `${daysDiff} days left` : "Active"}
              color={chipColor}
              size="small"
              sx={{ ml: 2, fontWeight: 'medium' }}
            />
          </Box>
        </Box>
        
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: statusColor }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Shield sx={{ color: statusColor, marginRight: 1 }} />
            <Typography variant="body2" sx={{ color: '#757575' }}>
              {statusText}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  // Detail item component
  const DetailItem = ({ label, value, icon: Icon, sensitive = false, showFull, toggleShow }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
      {Icon && <Icon sx={{ color: '#3B82F6', mt: 0.5, mr: 1.5, fontSize: 18 }} />}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'medium', color: '#757575', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        {sensitive ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#212121', mr: 1 }}>
              {maskSensitiveData(value, showFull)}
            </Typography>
            <IconButton 
              onClick={toggleShow}
              size="small"
              sx={{ p: 0.5, color: '#3B82F6' }}
            >
              {showFull ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#212121' }}>
            {value || 'N/A'}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
          Legal Documents
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          View and manage your pharmacy's legal documentation
        </Typography>
      </Box>

      <LicenseRenewalStatus />

      {/* Legal Documents Section */}
      <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', mb: 4, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
            Legal Documents & Certificates
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
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
                        e.target.parentElement.innerHTML = '<div style="width:100%;height:160px;background-color:#eee;display:flex;align-items:center;justify-content:center;border-radius:4px;"><span style="color:#3B82F6;">Document Preview</span></div>';
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
                      <ZoomIn sx={{ color: 'white', opacity: 0, transition: 'opacity 0.2s' }} />
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#212121', mb: 0.5, textAlign: 'left' }}>
                    {imageObj.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#757575', textAlign: 'left' }}>
                    Click to preview
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 6, textAlign: 'center', color: '#757575' }}>
            <Typography variant="body1" sx={{ color: '#212121' }}>
              No legal documents uploaded
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Business Registration Section */}
      <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', mb: 4, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#212121', mb: 1 }}>
            Business Registration
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
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
                    e.target.parentElement.innerHTML = '<div style="width:100%;height:200px;background-color:#eee;display:flex;align-items:center;justify-content:center;border-radius:4px;"><span style="color:#3B82F6;">Business Registration Preview</span></div>';
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
                  <ZoomIn sx={{ color: 'white', opacity: 0, transition: 'opacity 0.2s' }} />
                </Box>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#212121', mb: 0.5, textAlign: 'left' }}>
                Business Registration Document
              </Typography>
              <Typography variant="caption" sx={{ color: '#757575', textAlign: 'left' }}>
                Click to preview with zoom
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ py: 6, textAlign: 'center', color: '#757575' }}>
            <Typography variant="body1" sx={{ color: '#212121' }}>
              No business registration document uploaded
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Information Grid */}
      <Grid container spacing={4}>
        {/* Pharmacy Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#212121', mb: 3 }}>
              Pharmacy Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DetailItem label="Name" value={legalData.pharmacyName} icon={Business} />
              <DetailItem label="Address" value={legalData.pharmacyAddress} icon={MapPin} />
              <DetailItem label="Website" value={legalData.pharmacyWebsite} icon={Language} />
              <DetailItem 
                label="BR Number" 
                value={legalData.brNumber} 
                icon={CreditCard} 
                sensitive={true}
                showFull={showFullBR}
                toggleShow={() => setShowFullBR(!showFullBR)}
              />
              <DetailItem label="Email" value={legalData.pharmacyEmail} icon={Email} />
              <DetailItem label="Mobile" value={legalData.pharmacyMobile} icon={Phone} />
              <DetailItem label="Landline" value={legalData.pharmacyLandline} icon={Phone} />
            </Box>
          </Paper>
        </Grid>

        {/* Owner Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#212121', mb: 3 }}>
              Owner Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DetailItem label="Name" value={legalData.ownerName} icon={Person} />
              <DetailItem 
                label="NIC" 
                value={legalData.ownerNIC} 
                icon={CreditCard} 
                sensitive={true}
                showFull={showFullNIC}
                toggleShow={() => setShowFullNIC(!showFullNIC)}
              />
              <DetailItem label="Email" value={legalData.ownerEmail} icon={Email} />
              <DetailItem label="Phone" value={legalData.ownerPhone} icon={Phone} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Information Grid */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Responsible Pharmacist */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#212121', mb: 3 }}>
              Responsible Pharmacist
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DetailItem label="Name" value={legalData.pharmacistName} icon={Person} />
              <DetailItem 
                label="Registration Number" 
                value={legalData.pharmacistRegNumber} 
                icon={CreditCard} 
                sensitive={true}
                showFull={showFullReg}
                toggleShow={() => setShowFullReg(!showFullReg)}
              />
            </Box>
          </Paper>
        </Grid>

        {/* License & Renewal */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#212121', mb: 3 }}>
              License & Renewal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DetailItem label="Next Renewal Date" value={legalData.licenseRenewalDate} icon={CalendarToday} />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', py: 1 }}>
                <Shield sx={{ color: '#3B82F6', mt: 0.5, mr: 1.5, fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 'medium', color: '#757575', textTransform: 'uppercase' }}>
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
        </Grid>
      </Grid>

      {/* Image Popup */}
      {popupImage && (
        <Box 
          sx={{ 
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={closeImagePopup}
        >
          <Box 
            sx={{ 
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={popupImage} 
              alt="Document Preview" 
              style={{ 
                maxWidth: '90vw', 
                maxHeight: '90vh', 
                objectFit: 'contain' 
              }} 
            />
            <IconButton 
              onClick={closeImagePopup}
              sx={{ 
                position: 'absolute',
                top: -40,
                right: 0,
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LegalDocuments;