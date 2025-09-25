import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CheckCircle,
  Warning,
  Shield,
  Description,
  CalendarToday,
  Business,
  Person,
  Assignment
} from '@mui/icons-material';

const LegalDashboard = () => {
  const theme = useTheme();
  // Sample data - in a real app this would come from Firebase
  const complianceStatus = {
    licenseValid: true,
    documentsComplete: true,
    renewalDue: false,
    reminderActive: true
  };

  const upcomingDeadlines = [
    { id: 1, title: 'License Renewal', date: '2025-12-31', priority: 'high' },
    { id: 2, title: 'Business Registration', date: '2026-06-30', priority: 'medium' },
    { id: 3, title: 'Pharmacist Certification', date: '2026-11-15', priority: 'medium' }
  ];

  const recentDocuments = [
    { id: 1, title: 'Pharmacy License', status: 'valid' },
    { id: 2, title: 'Business Registration', status: 'valid' },
    { id: 3, title: 'Pharmacist Certificate', status: 'valid' }
  ];

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
          Legal Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Overview of your pharmacy's legal compliance status
        </Typography>
      </Box>

      {/* Compliance Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '8px',
                  backgroundColor: complianceStatus.licenseValid ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Shield sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    License Status
                  </Typography>
                  <Chip 
                    label={complianceStatus.licenseValid ? 'Valid' : 'Invalid'}
                    size="small"
                    sx={{ 
                      backgroundColor: complianceStatus.licenseValid ? '#10b981' : '#ef4444',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Pharmacy operating license is currently valid
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '8px',
                  backgroundColor: complianceStatus.documentsComplete ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Description sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Documents
                  </Typography>
                  <Chip 
                    label={complianceStatus.documentsComplete ? 'Complete' : 'Incomplete'}
                    size="small"
                    sx={{ 
                      backgroundColor: complianceStatus.documentsComplete ? '#10b981' : '#f59e0b',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                All required legal documents uploaded
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '8px',
                  backgroundColor: complianceStatus.renewalDue ? '#ef4444' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <CalendarToday sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Renewal Due
                  </Typography>
                  <Chip 
                    label={complianceStatus.renewalDue ? 'Yes' : 'No'}
                    size="small"
                    sx={{ 
                      backgroundColor: complianceStatus.renewalDue ? '#ef4444' : '#10b981',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                No immediate renewals required
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '8px',
                  backgroundColor: complianceStatus.reminderActive ? '#10b981' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Assignment sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Reminders
                  </Typography>
                  <Chip 
                    label={complianceStatus.reminderActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{ 
                      backgroundColor: complianceStatus.reminderActive ? '#10b981' : '#6b7280',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Automatic renewal reminders enabled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Deadlines and Recent Documents */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
                Upcoming Deadlines
              </Typography>
              <List>
                {upcomingDeadlines.map((deadline) => (
                  <ListItem 
                    key={deadline.id}
                    sx={{ 
                      py: 1.5,
                      borderBottom: '1px solid #f3f4f6',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarToday sx={{ 
                        fontSize: '18px',
                        color: deadline.priority === 'high' ? '#ef4444' : '#f59e0b'
                      }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={deadline.title}
                      secondary={deadline.date}
                      primaryTypographyProps={{ 
                        fontWeight: 'medium',
                        color: '#1f2937'
                      }}
                      secondaryTypographyProps={{ 
                        color: '#6b7280',
                        fontSize: '13px'
                      }}
                    />
                    <Chip 
                      label={deadline.priority}
                      size="small"
                      sx={{ 
                        backgroundColor: deadline.priority === 'high' ? '#fee2e2' : '#ffedd5',
                        color: deadline.priority === 'high' ? '#b91c1c' : '#c2410c',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
                Recent Documents
              </Typography>
              <List>
                {recentDocuments.map((doc) => (
                  <ListItem 
                    key={doc.id}
                    sx={{ 
                      py: 1.5,
                      borderBottom: '1px solid #f3f4f6',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Description sx={{ 
                        fontSize: '18px',
                        color: doc.status === 'valid' ? '#10b981' : '#f59e0b'
                      }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.title}
                      primaryTypographyProps={{ 
                        fontWeight: 'medium',
                        color: '#1f2937'
                      }}
                    />
                    <Chip 
                      label={doc.status}
                      size="small"
                      sx={{ 
                        backgroundColor: doc.status === 'valid' ? '#dcfce7' : '#fef3c7',
                        color: doc.status === 'valid' ? '#166534' : '#92400e',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LegalDashboard;