import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
<<<<<<< HEAD
import { AccountCircle, ExitToApp, LocalPharmacy, Dashboard, Settings } from '@mui/icons-material';
=======
import { AccountCircle, ExitToApp, Dashboard, TrendingUp } from '@mui/icons-material';
>>>>>>> SALES
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
<<<<<<< HEAD
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CoreERP - Pharmacy System
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => handleNavigation('/dashboard')}
          >
            Dashboard
          </Button>
          
          <Button
            color="inherit"
            startIcon={<LocalPharmacy />}
            onClick={() => handleNavigation('/pos')}
          >
            POS
          </Button>
          
          <Button
            color="inherit"
            startIcon={<Settings />}
            onClick={() => handleNavigation('/setup')}
          >
            Setup
=======
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#000000',
        boxShadow: 'none',
        borderBottom: '1px solid #333333'
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: '#ffffff',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          CoreERP
        </Typography>
        
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Button
            startIcon={<Dashboard />}
            onClick={() => navigate('/dashboard')}
            sx={{ 
              mr: 2,
              color: '#ffffff',
              backgroundColor: 'transparent',
              border: '1px solid #333333',
              borderRadius: '6px',
              px: 2,
              py: 1,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#333333',
                borderColor: '#555555'
              }
            }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<TrendingUp />}
            onClick={() => navigate('/sales')}
            sx={{ 
              mr: 2,
              color: '#ffffff',
              backgroundColor: 'transparent',
              border: '1px solid #333333',
              borderRadius: '6px',
              px: 2,
              py: 1,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#333333',
                borderColor: '#555555'
              }
            }}
          >
            Sales
>>>>>>> SALES
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 2,
              color: '#cccccc',
              fontSize: '13px'
            }}
          >
            {user?.displayName || user?.email}
          </Typography>
          
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{ 
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            {user?.photoURL ? (
              <Avatar src={user.photoURL} sx={{ width: 32, height: 32 }} />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                backgroundColor: '#000000',
                border: '1px solid #333333',
                '& .MuiMenuItem-root': {
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#333333'
                  }
                }
              }
            }}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
