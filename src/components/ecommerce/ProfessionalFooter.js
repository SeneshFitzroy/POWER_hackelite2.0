import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Security as SecurityIcon,
  LocalShipping as LocalShippingIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';

const ProfessionalFooter = () => {
  return (
    <Box component="footer" sx={{ 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      color: 'white',
      mt: 'auto'
    }}>
      {/* Main Footer Content */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img 
                src="/images/npk-logo.png" 
                alt="NPK Pharmacy" 
                style={{ 
                  height: '50px',
                  width: 'auto',
                  borderRadius: '6px',
                  objectFit: 'contain',
                  marginRight: '12px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline-flex';
                }}
              />
              <Box sx={{ display: 'none', alignItems: 'center', mr: 1.5 }}>
                <LocalPharmacyIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.7, mb: 3 }}>
              Your trusted healthcare partner providing quality medicines 
              and professional pharmaceutical services.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <VerifiedIcon sx={{ fontSize: 16, mr: 1, color: '#10b981' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Licensed & Certified Pharmacy
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2.5, color: 'white' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Home', 'Products', 'Categories', 'About Us'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  underline="none"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: 'white'
                    }
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2.5, color: 'white' }}>
              Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Online Orders', 'Home Delivery', 'Prescriptions', 'Support'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  underline="none"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: 'white'
                    }
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2.5, color: 'white' }}>
              Contact
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ fontSize: 18, mr: 1.5, color: 'white' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  +94 11 234 5678
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmailIcon sx={{ fontSize: 18, mr: 1.5, color: 'white' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  info@npkpharma.lk
                </Typography>
              </Box>
            </Box>

            {/* Social Media */}
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1.5, color: 'white' }}>
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: FacebookIcon, color: '#1877f2' },
                { icon: TwitterIcon, color: '#1da1f2' },
                { icon: InstagramIcon, color: '#e4405f' },
                { icon: LinkedInIcon, color: '#0a66c2' }
              ].map((social, index) => (
                <IconButton
                  key={index}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    p: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: social.color,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <social.icon fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Trust Indicators */}
      <Box sx={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        py: 3,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center" alignItems="center">
            {[
              { icon: SecurityIcon, label: 'Secure Payments' },
              { icon: LocalShippingIcon, label: 'Fast Delivery' },
              { icon: VerifiedIcon, label: 'Quality Assured' }
            ].map((item, index) => (
              <Grid item xs={4} sm={4} md={2} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <item.icon sx={{ fontSize: 24, color: '#10b981', mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block' }}>
                    {item.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Bottom Bar */}
      <Box sx={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
        py: 2,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              © 2025 NPK Pharma. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  underline="none"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease',
                    '&:hover': { color: 'white' }
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ProfessionalFooter;
