import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Container,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Users, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Award,
  FileText
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { initializeFirestore } from '../../../utils/hr/initializeFirestore';
import InitializeData from '../Setup/InitializeData';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingPayroll: 0,
    expiringLicenses: 0,
    todayAttendance: 0,
    pendingReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAndFetchData();
  }, []);

  const initializeAndFetchData = async () => {
    try {
      // Initialize Firestore collections if they don't exist
      await initializeFirestore();
      // Fetch dashboard stats
      await fetchDashboardStats();
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Failed to initialize application data');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch employees
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const activeEmployees = employees.filter(emp => emp.status === 'active');
      
      // Fetch licenses expiring in next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const licensesSnapshot = await getDocs(collection(db, 'licenses'));
      const expiringLicenses = licensesSnapshot.docs.filter(doc => {
        const license = doc.data();
        const expiryDate = new Date(license.expiryDate);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
      });

      setStats({
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        pendingPayroll: 5, // Mock data
        expiringLicenses: expiringLicenses.length,
        todayAttendance: Math.floor(activeEmployees.length * 0.85), // Mock 85% attendance
        pendingReviews: 3 // Mock data
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: '#1e40af',
      bgColor: '#eff6ff',
      link: '/employees'
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: TrendingUp,
      color: '#059669',
      bgColor: '#f0fdf4',
      link: '/employees'
    },
    {
      title: 'Pending Payroll',
      value: stats.pendingPayroll,
      icon: DollarSign,
      color: '#d97706',
      bgColor: '#fffbeb',
      link: '/payroll'
    },
    {
      title: 'Expiring Licenses',
      value: stats.expiringLicenses,
      icon: AlertTriangle,
      color: '#dc2626',
      bgColor: '#fef2f2',
      link: '/licenses'
    },
    {
      title: 'Today Attendance',
      value: stats.todayAttendance,
      icon: Clock,
      color: '#7c3aed',
      bgColor: '#faf5ff',
      link: '/attendance'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: FileText,
      color: '#4338ca',
      bgColor: '#eef2ff',
      link: '/performance'
    }
  ];

  const quickActions = [
    { title: 'Add New Employee', link: '/employees/new', icon: Users },
    { title: 'Process Payroll', link: '/payroll', icon: DollarSign },
    { title: 'Mark Attendance', link: '/attendance', icon: Clock },
    { title: 'License Tracking', link: '/licenses', icon: Award }
  ];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <CircularProgress size={60} sx={{ color: '#1e40af' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#1e3a8a',
            letterSpacing: '0.5px'
          }}
        >
          HR Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Users size={20} />}
          sx={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            px: 3,
            py: 1.5,
            fontWeight: 'bold',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              boxShadow: '0 6px 16px rgba(30, 64, 175, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Add New Employee
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(30, 58, 138, 0.15)',
                    borderColor: '#1e40af'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        backgroundColor: stat.bgColor,
                        width: 56,
                        height: 56,
                        mr: 2.5
                      }}
                    >
                      <Icon size={28} color={stat.color} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6b7280',
                          fontWeight: '500',
                          mb: 0.5,
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 'bold',
                          color: '#1f2937',
                          lineHeight: 1
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Actions */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          mb: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#1f2937',
              mb: 3,
              fontSize: '18px'
            }}
          >
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
                  <Card
                    sx={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        borderColor: '#1e40af',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            backgroundColor: '#f8fafc',
                            width: 40,
                            height: 40,
                            mr: 2
                          }}
                        >
                          <Icon size={20} color="#6b7280" />
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: '600',
                            color: '#374151',
                            fontSize: '14px'
                          }}
                        >
                          {action.title}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Paper>

      {/* Database Setup */}
      {stats.totalEmployees === 0 && (
        <Box sx={{ mb: 4 }}>
          <InitializeData />
        </Box>
      )}

      {/* Recent Activity */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#1f2937',
              mb: 3,
              fontSize: '18px'
            }}
          >
            Recent Activity
          </Typography>
          <List sx={{ p: 0 }}>
            <ListItem
              sx={{
                borderRadius: '10px',
                mb: 1,
                '&:hover': { backgroundColor: '#f9fafb' },
                transition: 'background-color 0.2s'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#10b981'
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary="New employee John Doe added to system"
                secondary="2 hours ago"
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}
                secondaryTypographyProps={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}
              />
            </ListItem>
            <ListItem
              sx={{
                borderRadius: '10px',
                mb: 1,
                '&:hover': { backgroundColor: '#f9fafb' },
                transition: 'background-color 0.2s'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b'
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Pharmacist license for Jane Smith expires in 15 days"
                secondary="1 day ago"
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}
                secondaryTypographyProps={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}
              />
            </ListItem>
            <ListItem
              sx={{
                borderRadius: '10px',
                '&:hover': { backgroundColor: '#f9fafb' },
                transition: 'background-color 0.2s'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6'
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Monthly payroll processed for 25 employees"
                secondary="3 days ago"
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}
                secondaryTypographyProps={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;