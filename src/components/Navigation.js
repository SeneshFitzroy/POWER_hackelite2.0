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
import { AccountCircle, ExitToApp, LocalPharmacy, Dashboard, Settings, TrendingUp } from '@mui/icons-material';
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
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CoreERP - Pharmacy System
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => handleNavigation('/')}
            sx={{ ml: 8 }}
          >
            Dashboard
          </Button>
          
          <Button
            color="inherit"
            startIcon={<LocalPharmacy />}
            onClick={() => handleNavigation('/pos')}
            sx={{ ml: 8 }}
          >
            POS
          </Button>
          
          <Button
            color="inherit"
            startIcon={<TrendingUp />}
            onClick={() => handleNavigation('/sales')}
            sx={{ ml: 8 }}
          >
            Sales
          </Button>
          
          <Button
            color="inherit"
            startIcon={<Settings />}
            onClick={() => handleNavigation('/setup')}
            sx={{ ml: 8 }}
          >
            Setup
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