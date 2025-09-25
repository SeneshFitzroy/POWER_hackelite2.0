import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Drawer,
  Divider,
  Button,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Gavel as ShieldIcon,
  Description as FileTextIcon,
  Book as BookIcon,
  Logout
} from '@mui/icons-material';
import LegalDashboard from './LegalDashboard';
import LegalDocuments from './LegalDocuments';
import LegalRegulations from './LegalRegulations';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`legal-tabpanel-${index}`}
      aria-labelledby={`legal-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function LegalModule() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarWidth = 280;

  const navigationItems = [
    { label: 'Legal Dashboard', icon: <DashboardIcon />, index: 0 },
    { label: 'Legal Documents', icon: <FileTextIcon />, index: 1 },
    { label: 'Regulations', icon: <ShieldIcon />, index: 2 }
  ];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNavClick = (index) => {
    setActiveTab(index);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate back to login screen
    window.location.href = '/?screen=login';
  };

  const drawerContent = (
    <>
      {/* Sidebar Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            color: '#ffffff',
            mb: 1
          }}
        >
          COREERP
        </Typography>
        <Chip 
          label="LEGAL MODULE" 
          variant="outlined" 
          size="small"
          sx={{ 
            color: 'white', 
            borderColor: 'rgba(255,255,255,0.5)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            fontWeight: 'bold',
            fontSize: '10px'
          }} 
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.index} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavClick(item.index)}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                px: 2,
                backgroundColor: activeTab === item.index ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                transition: 'all 0.2s ease-in-out',
                boxShadow: activeTab === item.index ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#ffffff',
                  minWidth: 40,
                  '& .MuiSvgIcon-root': {
                    fontSize: '22px'
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '14px',
                    fontWeight: activeTab === item.index ? 'bold' : 'medium',
                    color: '#ffffff'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.15)', mx: 2 }} />

      {/* Time and Date Display */}
      <Box sx={{ p: 3, mt: 'auto' }}>
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: 3,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            py: 2,
            px: 2,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '11px',
              fontWeight: 'medium',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 0.5
            }}
          >
            Current Date & Time
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold', 
              fontSize: '15px',
              mb: 0.3
            }}
          >
            {currentTime.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: '14px',
              fontWeight: 'medium'
            }}
          >
            {currentTime.toLocaleTimeString('en-US', { 
              hour12: true,
              hour: 'numeric',
              minute: '2-digit'
            })}
          </Typography>
        </Box>

        {/* Logout Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderRadius: '10px',
            py: 1.5,
            mt: 2,
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            border: '1px solid rgba(220, 38, 38, 0.8)',
            '&:hover': {
              backgroundColor: '#b91c1c',
              boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Logout
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: '#1e3a8a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Legal Module
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
            color: '#ffffff',
            borderRight: 'none',
            boxShadow: '4px 0 12px rgba(0,0,0,0.15)'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
            color: '#ffffff',
            borderRight: 'none',
            boxShadow: '4px 0 12px rgba(0,0,0,0.15)'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          ml: { md: 0 },
          mt: { xs: 8, md: 0 }, // Add top margin on mobile for AppBar
          width: { md: `calc(100% - ${sidebarWidth}px)` }
        }}
      >
        {/* Content Container */}
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: 3, 
            minHeight: '100vh',
            px: { xs: 2, sm: 3 } // Responsive padding
          }}
        >
          <TabPanel value={activeTab} index={0}>
            <LegalDashboard />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <LegalDocuments />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <LegalRegulations />
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
}