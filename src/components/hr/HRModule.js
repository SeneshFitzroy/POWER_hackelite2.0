import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
  useTheme,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Schedule,
  AttachMoney,
  VerifiedUser,
  Logout,
  Menu as MenuIcon
} from '@mui/icons-material';
import Dashboard from './Dashboard/Dashboard';
import EmployeeList from './Employee/EmployeeList';
import AddEmployee from './Employee/AddEmployee';
import ViewEmployee from './Employee/ViewEmployee';
import EmployeeForm from './Employee/EmployeeForm';
import TestFirestore from './Employee/TestFirestore';
import AttendanceList from './Attendance/AttendanceList';
import PayrollList from './Payroll/PayrollList';
import LicenseTracking from './License/LicenseTracking';

export default function HRModule() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarWidth = 280;

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === '/hr' || location.pathname === '/hr/') return 0;
    if (location.pathname === '/hr/employees') return 1;
    if (location.pathname === '/hr/employees/new') return 1;
    if (location.pathname.startsWith('/hr/employees/')) return 1;
    if (location.pathname === '/hr/attendance') return 2;
    if (location.pathname === '/hr/payroll') return 3;
    if (location.pathname === '/hr/licenses') return 4;
    return 0;
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const navigationItems = [
    { label: 'HR Dashboard', icon: <DashboardIcon />, path: '/hr' },
    { label: 'Employee Management', icon: <People />, path: '/hr/employees' },
    { label: 'Attendance', icon: <Schedule />, path: '/hr/attendance' },
    { label: 'Payroll', icon: <AttachMoney />, path: '/hr/payroll' },
    { label: 'License Tracking', icon: <VerifiedUser />, path: '/hr/licenses' }
  ];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location]);

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    console.log('HR Logout initiated - Enhanced logout system');
    
    // Clear only HR-specific data, not main authentication
    localStorage.removeItem('hrSession');
    localStorage.removeItem('currentHRView');
    sessionStorage.removeItem('hrData');
    
    // Set multiple dashboard access flags for maximum reliability
    localStorage.setItem('dashboardAccess', 'true');
    localStorage.setItem('forceDashboard', 'true');
    localStorage.setItem('skipAuth', 'true');
    localStorage.setItem('directToDashboard', 'true');
    
    console.log('HR logout: All dashboard flags set');
    
    // Force immediate redirect to prevent any routing glitches
    setTimeout(() => {
      window.location.replace('/?screen=dashboard');
    }, 100);
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
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <img 
            src="/images/npk-logo.png" 
            alt="NPK Pharmacy" 
            style={{ 
              height: '60px',
              width: 'auto',
              marginBottom: '8px',
              borderRadius: '8px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Box>
        <Chip 
          label="HR MODULE" 
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
        {navigationItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavClick(item.path)}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                px: 2,
                backgroundColor: activeTab === index ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                transition: 'all 0.2s ease-in-out',
                boxShadow: activeTab === index ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
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
                    fontWeight: activeTab === index ? 'bold' : 'medium',
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
              HR Module
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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id" element={<ViewEmployee />} />
            <Route path="/employees/:id/edit" element={<EmployeeForm />} />
            <Route path="/test-firestore" element={<TestFirestore />} />
            <Route path="/attendance" element={<AttendanceList />} />
            <Route path="/payroll" element={<PayrollList />} />
            <Route path="/licenses" element={<LicenseTracking />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}