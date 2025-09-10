import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  Gavel as GavelIcon,
  Block as BlockIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useRole } from '../contexts/RoleContext';

const ERPNavigation = ({ 
  activeModule, 
  onModuleChange, 
  onLogout,
  open,
  onToggle
}) => {
  const { user, getRoleInfo, hasPermission } = useRole();
  const roleInfo = getRoleInfo();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      permission: 'view_all_modules'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <InventoryIcon />,
      permission: 'view_stock',
      subItems: [
        {
          id: 'stock-tracking',
          label: 'Stock Tracking',
          icon: <InventoryIcon />,
          permission: 'view_stock'
        },
        {
          id: 'reorder-management',
          label: 'Reorder Management',
          icon: <ShoppingCartIcon />,
          permission: 'view_stock'
        },
        {
          id: 'purchase-orders',
          label: 'Purchase Orders',
          icon: <AssignmentIcon />,
          permission: 'view_purchase_orders'
        },
        {
          id: 'supplier-management',
          label: 'Supplier Management',
          icon: <BusinessIcon />,
          permission: 'manage_suppliers'
        },
        {
          id: 'purchase-history',
          label: 'Purchase History',
          icon: <HistoryIcon />,
          permission: 'view_purchase_orders'
        },
        {
          id: 'quarantine-management',
          label: 'Quarantine Management',
          icon: <BlockIcon />,
          permission: 'manage_quarantine'
        },
        {
          id: 'expiry-monitoring',
          label: 'Expiry Monitoring',
          icon: <ScheduleIcon />,
          permission: 'view_stock'
        },
        {
          id: 'low-stock-alerts',
          label: 'Low Stock Alerts',
          icon: <WarningIcon />,
          permission: 'view_stock'
        }
      ]
    },
    {
      id: 'compliance',
      label: 'Regulatory Compliance',
      icon: <GavelIcon />,
      permission: 'view_compliance'
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    hasPermission(item.permission)
  );

  const drawerWidth = 280;

  return (
    <>
      {/* Mobile Menu Button */}
      <IconButton
        onClick={onToggle}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1300,
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: { xs: 'flex', md: 'none' }
        }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      {/* Navigation Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#1e3a8a',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Pharma ERP
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Inventory Management System
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* User Info */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#3b82f6', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {user?.name || 'User'}
              </Typography>
              <Chip
                label={roleInfo.name}
                size="small"
                sx={{ 
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '0.75rem',
                  height: 20
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Navigation Items */}
        <List sx={{ flexGrow: 1, px: 1 }}>
          {filteredItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => onModuleChange(item.id)}
                  selected={activeModule === item.id}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: '#3b82f6',
                      '&:hover': {
                        backgroundColor: '#2563eb'
                      }
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: activeModule === item.id ? 'bold' : 'normal'
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* Sub Items */}
              {item.subItems && activeModule === item.id && (
                <Box sx={{ ml: 2, mt: 1 }}>
                  {item.subItems
                    .filter(subItem => hasPermission(subItem.permission))
                    .map((subItem) => (
                      <ListItem key={subItem.id} disablePadding>
                        <ListItemButton
                          onClick={() => onModuleChange(subItem.id)}
                          selected={activeModule === subItem.id}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            pl: 4,
                            '&.Mui-selected': {
                              backgroundColor: '#3b82f6',
                              '&:hover': {
                                backgroundColor: '#2563eb'
                              }
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={subItem.label}
                            primaryTypographyProps={{ 
                              fontSize: '0.85rem',
                              fontWeight: activeModule === subItem.id ? 'bold' : 'normal'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                </Box>
              )}
            </React.Fragment>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Logout */}
        <List sx={{ px: 1, pb: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={onLogout}
              sx={{
                borderRadius: 1,
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#1e3a8a',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Pharma ERP
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Inventory Management System
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* User Info */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#3b82f6', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {user?.name || 'User'}
              </Typography>
              <Chip
                label={roleInfo.name}
                size="small"
                sx={{ 
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '0.75rem',
                  height: 20
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Navigation Items */}
        <List sx={{ flexGrow: 1, px: 1 }}>
          {filteredItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    onModuleChange(item.id);
                    onToggle();
                  }}
                  selected={activeModule === item.id}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: '#3b82f6',
                      '&:hover': {
                        backgroundColor: '#2563eb'
                      }
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: activeModule === item.id ? 'bold' : 'normal'
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* Sub Items */}
              {item.subItems && activeModule === item.id && (
                <Box sx={{ ml: 2, mt: 1 }}>
                  {item.subItems
                    .filter(subItem => hasPermission(subItem.permission))
                    .map((subItem) => (
                      <ListItem key={subItem.id} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            onModuleChange(subItem.id);
                            onToggle();
                          }}
                          selected={activeModule === subItem.id}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            pl: 4,
                            '&.Mui-selected': {
                              backgroundColor: '#3b82f6',
                              '&:hover': {
                                backgroundColor: '#2563eb'
                              }
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={subItem.label}
                            primaryTypographyProps={{ 
                              fontSize: '0.85rem',
                              fontWeight: activeModule === subItem.id ? 'bold' : 'normal'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                </Box>
              )}
            </React.Fragment>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Logout */}
        <List sx={{ px: 1, pb: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                onLogout();
                onToggle();
              }}
              sx={{
                borderRadius: 1,
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default ERPNavigation;
