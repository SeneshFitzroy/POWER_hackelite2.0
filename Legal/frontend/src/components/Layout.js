import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Eye,
  Menu,
  X,
  Home
} from 'lucide-react';
import {
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  CssBaseline,
  Paper,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';

const drawerWidth = 280;

// Custom colors for the legal module
const COLORS = {
  darkBlue: '#1E3A8A',    // For sidebar and main buttons
  mediumBlue: '#3B82F6',  // For headers and interactive elements
  lightGray: '#f8f9fa',   // For main content background
  darkGray: '#212121',    // For main text
  lighterGray: '#757575'  // For secondary text
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: drawerWidth,
    flexShrink: 0,
  },
}));

const DrawerPaper = styled(Paper)(({ theme }) => ({
  width: drawerWidth,
  backgroundColor: COLORS.darkBlue, // Using dark blue for sidebar
  color: 'white',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  margin: 0,
  backgroundColor: COLORS.lightGray, // Light gray background for main content
  [theme.breakpoints.up('md')]: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
}));

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Check if current path is admin to show admin navigation
  const isAdminPath = location.pathname.includes('/admin');
  
  const navigation = isAdminPath ? [
    { name: 'Legal Overview', href: '/', icon: Home },
    { name: 'Admin - Edit Legal Info', href: '/admin', icon: FileText },
    { name: 'Regulations', href: '/regulations', icon: FileText },
  ] : [
    { name: 'Legal Overview', href: '/', icon: Home },
    { name: 'Regulations', href: '/regulations', icon: FileText },
  ];

  const currentDate = new Date();
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

  const drawerContent = (
    <DrawerPaper elevation={0}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'flex-start' }}>
          <img 
            src="/images/npk-logo.png" 
            alt="NPK New Pharmacy Kalutara" 
            style={{ 
              height: '40px', 
              width: 'auto', 
              marginRight: '12px',
              border: '2px solid #000000',
              borderRadius: '4px',
              padding: '4px',
              backgroundColor: 'white',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              display: 'none', // Hidden by default, shows if logo fails
              fontSize: '1.1rem'
            }}
          >
            NPK Pharmacy
          </Typography>
        </Box>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 'medium',
            backgroundColor: COLORS.mediumBlue, // Medium blue for module badge
            color: 'white',
          }}
        >
          LEGAL MODULE
        </Box>
      </Box>
      
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mx: 2 }} />
      
      <List sx={{ px: 2, mt: 2, flexGrow: 1 }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isSelected = location.pathname === item.href;
          
          return (
            <ListItem
              key={item.name}
              component={Link}
              to={item.href}
              onClick={() => isMdUp || setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: isSelected ? COLORS.mediumBlue : 'transparent', // Medium blue for selected items
                color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: COLORS.mediumBlue, // Medium blue on hover
                  color: 'white',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  fontWeight: isSelected ? 'bold' : 'normal'
                }} 
              />
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mx: 2 }} />
      
      <Box sx={{ p: 2 }}>
        
        {/* Logout Button */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#dc2626',
            color: 'white',
            '&:hover': {
              backgroundColor: '#b91c1c'
            },
            borderRadius: 2,
            py: 1.5,
            fontWeight: 'bold'
          }}
          onClick={() => {
            // Clear any stored auth data
            localStorage.clear();
            sessionStorage.clear();
            // Redirect to main ERP login
            window.location.href = '/';
          }}
        >
          LOGOUT
        </Button>
      </Box>
    </DrawerPaper>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        sx={{
          [theme.breakpoints.up('md')]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
          },
          backgroundColor: 'white',
          color: COLORS.darkGray, // Dark gray for text
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: { xs: 'block', md: 'none' }
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
            <Menu />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/images/npk-logo.png" 
              alt="NPK New Pharmacy Kalutara" 
              style={{ 
                height: '32px', 
                width: 'auto', 
                marginRight: '10px',
                border: '1px solid #000000',
                borderRadius: '3px',
                padding: '2px',
                backgroundColor: 'white',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline-block';
              }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: COLORS.darkGray, 
                fontWeight: 'bold',
                display: 'none', // Hidden by default, shows if logo fails
                fontSize: '1rem'
              }}
            >
              NPK Pharmacy
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <StyledDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </StyledDrawer>
      
      {/* Desktop Drawer */}
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </StyledDrawer>
      
      {/* Main Content */}
      <Main>
        <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
        <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default Layout;