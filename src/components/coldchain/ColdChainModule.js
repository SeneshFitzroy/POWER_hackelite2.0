// Cold Chain Monitoring Module - Blue Theme (v2.1 - Cache Refresh)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
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
  Card,
  CardContent,
  Grid,
  Paper,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  DatePicker,
  LocalizationProvider,
  AdapterDateFns
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Thermostat,
  Warning,
  Assessment,
  Settings,
  WaterDrop,
  CheckCircle,
  Error,
  PlayArrow,
  Stop,
  Refresh,
  Download,
  PictureAsPdf,
  Logout,
  TableChart,
  TrendingUp,
  TrendingDown,
  Edit,
  Save,
  Cancel,
  Email,
  Delete,
  PriorityHigh,
  AccessTime
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import coldChainService from '../../services/coldChainService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`coldchain-tabpanel-${index}`}
      aria-labelledby={`coldchain-tab-${index}`}
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

export default function ColdChainModule() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sensors, setSensors] = useState([]);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [reportsTab, setReportsTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date()
  });
  const [selectedSensorFilter, setSelectedSensorFilter] = useState('all');
  const [editingSensor, setEditingSensor] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: ''
  });

  const sidebarWidth = 280;

  const handleLogout = () => {
    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate back to login screen
    window.location.href = '/?screen=login';
  };

  const navigationItems = [
    { label: 'Cold Chain Dashboard', icon: <DashboardIcon />, index: 0 },
    { label: 'Alerts & Notifications', icon: <Warning />, index: 1 },
    { label: 'Reports & Analytics', icon: <Assessment />, index: 2 },
    { label: 'Settings', icon: <Settings />, index: 3 }
  ];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize service and start simulation
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        await coldChainService.start();
        setIsRunning(true);
        
        // Set up real-time listeners
        coldChainService.onSensors((sensorData) => {
          setSensors(sensorData);
        });
        
        coldChainService.onSensorReadings((readingData) => {
          setReadings(readingData);
        });
        
        coldChainService.onAlerts((alertData) => {
          setAlerts(alertData);
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Cold Chain service:', error);
        setIsLoading(false);
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      coldChainService.stop();
    };
  }, []);

  const handleNavClick = (index, action) => {
    if (action) {
      action(); // Execute the action (like logout)
    } else {
      setActiveTab(index);
    }
  };

  const handleStartStop = () => {
    if (isRunning) {
      coldChainService.stop();
      setIsRunning(false);
    } else {
      coldChainService.start();
      setIsRunning(true);
    }
  };

  const handleSettingsOpen = (sensor) => {
    setSelectedSensor(sensor);
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
    setSelectedSensor(null);
  };

  const handleUpdateSettings = async () => {
    if (selectedSensor) {
      try {
        await coldChainService.updateSensorSettings(selectedSensor.id, {
          acceptableTempMin: selectedSensor.acceptableTempMin,
          acceptableTempMax: selectedSensor.acceptableTempMax,
          acceptableHumidityMin: selectedSensor.acceptableHumidityMin,
          acceptableHumidityMax: selectedSensor.acceptableHumidityMax
        });
        handleSettingsClose();
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await coldChainService.resolveAlert(alertId);
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await coldChainService.deleteAlert(alertId);
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleSendEmail = (alert) => {
    setSelectedAlert(alert);
    setEmailForm({
      to: 'pharmacy.owner@company.com', // Default email
      subject: `CRITICAL ALERT: ${alert.sensorName} - ${alert.type.toUpperCase()} Alert`,
      message: `Alert Details:
Sensor: ${alert.sensorName}
Type: ${alert.type.toUpperCase()}
Value: ${alert.value}${alert.type === 'temperature' ? '°C' : '%'}
Threshold: ${alert.threshold}${alert.type === 'temperature' ? '°C' : '%'}
Time: ${new Date(alert.createdAt?.toDate?.() || alert.createdAt).toLocaleString()}

This is a critical alert that requires immediate attention. Please check the sensor and take appropriate action.

Best regards,
Cold Chain Monitoring System`
    });
    setEmailDialogOpen(true);
  };

  const handleSendEmailSubmit = async () => {
    try {
      // In a real application, you would integrate with an email service
      console.log('Sending email:', emailForm);
      
      // Simulate email sending
      alert('Email sent successfully!');
      setEmailDialogOpen(false);
      setSelectedAlert(null);
      setEmailForm({ to: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleEmailDialogClose = () => {
    setEmailDialogOpen(false);
    setSelectedAlert(null);
    setEmailForm({ to: '', subject: '', message: '' });
  };

  const isCriticalAlert = (alert) => {
    // Consider an alert critical if it's been active for more than 30 minutes
    const alertTime = new Date(alert.createdAt?.toDate?.() || alert.createdAt);
    const now = new Date();
    const timeDiff = now - alertTime;
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff > 30;
  };

  const getAlertSeverity = (alert) => {
    if (isCriticalAlert(alert)) return 'error';
    return 'warning';
  };

  const getAlertIcon = (alert) => {
    if (isCriticalAlert(alert)) return <PriorityHigh />;
    return <Warning />;
  };

  const getStatusColor = (sensor, reading) => {
    if (!reading) return '#6b7280';
    
    const tempValid = reading.temperature >= sensor.acceptableTempMin && 
                     reading.temperature <= sensor.acceptableTempMax;
    const humidityValid = reading.humidity >= sensor.acceptableHumidityMin && 
                         reading.humidity <= sensor.acceptableHumidityMax;
    
    if (tempValid && humidityValid) return '#3b82f6';
    if (!tempValid || !humidityValid) return '#ef4444';
    return '#f59e0b';
  };

  const getStatusIcon = (sensor, reading) => {
    if (!reading) return <Error />;
    
    const tempValid = reading.temperature >= sensor.acceptableTempMin && 
                     reading.temperature <= sensor.acceptableTempMax;
    const humidityValid = reading.humidity >= sensor.acceptableHumidityMin && 
                         reading.humidity <= sensor.acceptableHumidityMax;
    
    if (tempValid && humidityValid) return <CheckCircle />;
    if (!tempValid || !humidityValid) return <Error />;
    return <Warning />;
  };

  const getLatestReading = (sensorId) => {
    return readings.find(reading => reading.sensorId === sensorId);
  };

  const getChartData = (sensorId) => {
    const sensorReadings = readings
      .filter(reading => reading.sensorId === sensorId)
      .slice(0, 20)
      .reverse();
    
    return sensorReadings.map(reading => ({
      time: new Date(reading.timestamp?.toDate?.() || reading.timestamp).toLocaleTimeString(),
      temperature: reading.temperature,
      humidity: reading.humidity
    }));
  };

  // Download functionality
  const downloadCSV = () => {
    const filteredReadings = getFilteredReadings();
    const csvContent = generateCSV(filteredReadings);
    downloadFile(csvContent, 'cold-chain-report.csv', 'text/csv');
  };

  const downloadPDF = () => {
    const filteredReadings = getFilteredReadings();
    const pdfContent = generatePDF(filteredReadings);
    downloadFile(pdfContent, 'cold-chain-report.pdf', 'application/pdf');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateCSV = (readings) => {
    const headers = ['Sensor Name', 'Location', 'Temperature (°C)', 'Humidity (%)', 'Timestamp', 'Status'];
    const csvRows = [headers.join(',')];
    
    readings.forEach(reading => {
      const sensor = sensors.find(s => s.id === reading.sensorId);
      const status = getStatusColor(sensor, reading) === '#3b82f6' ? 'Normal' : 'Alert';
      const timestamp = new Date(reading.timestamp?.toDate?.() || reading.timestamp).toLocaleString();
      
      csvRows.push([
        sensor?.name || 'Unknown',
        sensor?.location || 'Unknown',
        reading.temperature,
        reading.humidity,
        timestamp,
        status
      ].join(','));
    });
    
    return csvRows.join('\n');
  };

  const generatePDF = (readings) => {
    // Simple PDF generation (in a real app, you'd use a library like jsPDF)
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
72 720 Td
(Cold Chain Monitoring Report) Tj
0 -20 Td
(Generated: ${new Date().toLocaleString()}) Tj
0 -20 Td
(Total Readings: ${readings.length}) Tj
0 -20 Td
(Active Alerts: ${alerts.length}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
454
%%EOF
    `;
    return pdfContent;
  };

  const getFilteredReadings = () => {
    let filtered = readings;
    
    // Filter by sensor
    if (selectedSensorFilter !== 'all') {
      filtered = filtered.filter(reading => reading.sensorId === selectedSensorFilter);
    }
    
    // Filter by date range
    filtered = filtered.filter(reading => {
      const readingDate = new Date(reading.timestamp?.toDate?.() || reading.timestamp);
      return readingDate >= dateRange.startDate && readingDate <= dateRange.endDate;
    });
    
    return filtered;
  };

  const getSensorStatistics = () => {
    const filteredReadings = getFilteredReadings();
    const sensorStats = {};
    
    sensors.forEach(sensor => {
      const sensorReadings = filteredReadings.filter(r => r.sensorId === sensor.id);
      if (sensorReadings.length > 0) {
        const temps = sensorReadings.map(r => r.temperature);
        const humidities = sensorReadings.map(r => r.humidity);
        
        sensorStats[sensor.id] = {
          name: sensor.name,
          location: sensor.location,
          readingCount: sensorReadings.length,
          avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2),
          minTemp: Math.min(...temps).toFixed(2),
          maxTemp: Math.max(...temps).toFixed(2),
          avgHumidity: (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(2),
          minHumidity: Math.min(...humidities).toFixed(2),
          maxHumidity: Math.max(...humidities).toFixed(2),
          alertCount: alerts.filter(a => a.sensorId === sensor.id).length
        };
      }
    });
    
    return sensorStats;
  };

  // Sensor editing functions
  const handleEditSensor = (sensor) => {
    setEditingSensor(sensor);
    setEditFormData({
      name: sensor.name,
      location: sensor.location,
      acceptableTempMin: sensor.acceptableTempMin,
      acceptableTempMax: sensor.acceptableTempMax,
      acceptableHumidityMin: sensor.acceptableHumidityMin,
      acceptableHumidityMax: sensor.acceptableHumidityMax
    });
  };

  const handleSaveSensor = async () => {
    if (editingSensor) {
      try {
        await coldChainService.updateSensorSettings(editingSensor.id, editFormData);
        setEditingSensor(null);
        setEditFormData({});
      } catch (error) {
        console.error('Error updating sensor:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSensor(null);
    setEditFormData({});
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Left Sidebar Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            backgroundColor: '#1e40af', // Blue fallback
            background: 'linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%) !important',
            color: '#ffffff',
            borderRight: 'none',
            boxShadow: '4px 0 12px rgba(0,0,0,0.15)'
          },
        }}
      >
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
            variant="h4" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold', 
              mb: 1,
              fontSize: '1.8rem'
            }}
          >
            COREERP
          </Typography>
          <Chip 
            label="COLD CHAIN" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }} 
          />
        </Box>

        {/* Navigation Menu */}
        <List sx={{ px: 2, mt: 2, flexGrow: 1 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.index, item.action)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: activeTab === item.index ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: activeTab === item.index ? 'bold' : 'normal'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.15)', mx: 2 }} />

        {/* Time and Status Display */}
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
              Cold Chain Status
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#3b82f6', 
                fontWeight: 'bold', 
                fontSize: '15px',
                mb: 0.3
              }}
            >
              Active
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
          
          {/* Red Logout Button */}
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
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          ml: 0
        }}
      >
        {/* Content Container */}
        <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <Box sx={{ textAlign: 'center' }}>
                <LinearProgress sx={{ mb: 2, width: 200 }} />
                <Typography variant="h6">Initializing Cold Chain Monitoring...</Typography>
              </Box>
            </Box>
          ) : (
            <>
              <TabPanel value={activeTab} index={0}>
                {/* Cold Chain Dashboard */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ color: '#1f2937', fontWeight: 'bold' }}>
                      🌡️ Cold Chain Monitoring Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip 
                        icon={isRunning ? <PlayArrow /> : <Stop />}
                        label={isRunning ? 'Running' : 'Stopped'}
                        color={isRunning ? 'success' : 'error'}
                        variant="outlined"
                      />
                      <Button
                        variant="outlined"
                        startIcon={isRunning ? <Stop /> : <PlayArrow />}
                        onClick={handleStartStop}
                        size="small"
                      >
                        {isRunning ? 'Stop' : 'Start'} Simulation
                      </Button>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={3}>
                    {sensors.map((sensor) => {
                      const latestReading = getLatestReading(sensor.id);
                      const statusColor = getStatusColor(sensor, latestReading);
                      const statusIcon = getStatusIcon(sensor, latestReading);
                      const chartData = getChartData(sensor.id);
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={sensor.id}>
                          <Card 
                            sx={{ 
                              height: '100%',
                              border: `2px solid ${statusColor}`,
                              borderRadius: 2,
                              '&:hover': {
                                boxShadow: 4
                              }
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                                  {sensor.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {statusIcon}
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: statusColor,
                                      fontWeight: 'bold',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    {latestReading ? 
                                      (statusColor === '#3b82f6' ? 'Normal' : 
                                       statusColor === '#ef4444' ? 'Alert' : 'Warning') : 'No Data'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                📍 {sensor.location}
                              </Typography>
                              
                              {latestReading ? (
                                <>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Thermostat sx={{ color: '#3b82f6' }} />
                                      <Typography variant="body2">Temperature</Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
                                      {latestReading.temperature}°C
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <WaterDrop sx={{ color: '#06b6d4' }} />
                                      <Typography variant="body2">Humidity</Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#06b6d4' }}>
                                      {latestReading.humidity}%
                                    </Typography>
                                  </Box>
                                  
                                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                    Last updated: {new Date(latestReading.timestamp?.toDate?.() || latestReading.timestamp).toLocaleTimeString()}
                                  </Typography>
                                  
                                  {chartData.length > 1 && (
                                    <Box sx={{ height: 100, mb: 2 }}>
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis dataKey="time" hide />
                                          <YAxis hide />
                                          <RechartsTooltip />
                                          <Line 
                                            type="monotone" 
                                            dataKey="temperature" 
                                            stroke="#3b82f6" 
                                            strokeWidth={2}
                                            dot={false}
                                          />
                                          <Line 
                                            type="monotone" 
                                            dataKey="humidity" 
                                            stroke="#06b6d4" 
                                            strokeWidth={2}
                                            dot={false}
                                          />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </Box>
                                  )}
                                </>
                              ) : (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    No data available
                                  </Typography>
                                </Box>
                              )}
                              
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleSettingsOpen(sensor)}
                                sx={{ mt: 1 }}
                              >
                                Settings
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </TabPanel>
          
              <TabPanel value={activeTab} index={1}>
                {/* Alerts Management */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ color: '#1f2937', fontWeight: 'bold' }}>
                      🚨 Alerts & Notifications
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip 
                        label={`${alerts.length} Active Alerts`}
                        color={alerts.length > 0 ? 'error' : 'success'}
                        variant="outlined"
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => window.location.reload()}
                        size="small"
                      >
                        Refresh
                      </Button>
                    </Box>
                  </Box>
                  
                  {alerts.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <CheckCircle sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
                      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                        No Active Alerts
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        All sensors are operating within normal parameters
                      </Typography>
                    </Paper>
                  ) : (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Warning color="error" />
                          Active Alerts ({alerts.length})
                        </Typography>
                        
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell>Sensor</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell>Threshold</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {alerts.map((alert) => {
                                const isCritical = isCriticalAlert(alert);
                                const alertTime = new Date(alert.createdAt?.toDate?.() || alert.createdAt);
                                const now = new Date();
                                const duration = Math.floor((now - alertTime) / (1000 * 60)); // minutes
                                
                                return (
                                  <TableRow key={alert.id} sx={{ 
                                    backgroundColor: isCritical ? '#fef2f2' : '#fffbeb',
                                    '&:hover': { backgroundColor: isCritical ? '#fee2e2' : '#fef3c7' }
                                  }}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getAlertIcon(alert)}
                                        <Chip
                                          label={isCritical ? 'CRITICAL' : 'WARNING'}
                                          color={isCritical ? 'error' : 'warning'}
                                          size="small"
                                          icon={isCritical ? <PriorityHigh /> : <Warning />}
                                        />
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {alert.sensorName}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={alert.type.toUpperCase()}
                                        color={alert.type === 'temperature' ? 'primary' : 'secondary'}
                                        size="small"
                                        icon={alert.type === 'temperature' ? <Thermostat /> : <WaterDrop />}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="h6" sx={{ 
                                        color: isCritical ? '#dc2626' : '#d97706',
                                        fontWeight: 'bold'
                                      }}>
                                        {alert.value}{alert.type === 'temperature' ? '°C' : '%'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary">
                                        {alert.threshold}{alert.type === 'temperature' ? '°C' : '%'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AccessTime fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                          {duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h ${duration % 60}m`}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Resolve Alert">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleResolveAlert(alert.id)}
                                            color="success"
                                          >
                                            <CheckCircle />
                                          </IconButton>
                                        </Tooltip>
                                        
                                        {isCritical && (
                                          <Tooltip title="Send Email Notification">
                                            <IconButton
                                              size="small"
                                              onClick={() => handleSendEmail(alert)}
                                              color="primary"
                                            >
                                              <Email />
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                        
                                        <Tooltip title="Delete Alert">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleDeleteAlert(alert.id)}
                                            color="error"
                                          >
                                            <Delete />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              </TabPanel>
              
              <TabPanel value={activeTab} index={2}>
                {/* Reports Management */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ color: '#1f2937', fontWeight: 'bold' }}>
                      📊 Reports & Analytics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<TableChart />}
                        onClick={downloadCSV}
                        sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                      >
                        Download CSV
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf />}
                        onClick={downloadPDF}
                        sx={{ borderColor: '#ef4444', color: '#ef4444' }}
                      >
                        Download PDF
                      </Button>
                    </Box>
                  </Box>

                  {/* Filter Controls */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Filter Options
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <Typography variant="body2" sx={{ mb: 1 }}>Sensor</Typography>
                            <Select
                              value={selectedSensorFilter}
                              onChange={(e) => setSelectedSensorFilter(e.target.value)}
                            >
                              <MenuItem value="all">All Sensors</MenuItem>
                              {sensors.map(sensor => (
                                <MenuItem key={sensor.id} value={sensor.id}>
                                  {sensor.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" sx={{ mb: 1 }}>Start Date</Typography>
                          <TextField
                            type="date"
                            size="small"
                            fullWidth
                            value={dateRange.startDate.toISOString().split('T')[0]}
                            onChange={(e) => setDateRange(prev => ({
                              ...prev,
                              startDate: new Date(e.target.value)
                            }))}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" sx={{ mb: 1 }}>End Date</Typography>
                          <TextField
                            type="date"
                            size="small"
                            fullWidth
                            value={dateRange.endDate.toISOString().split('T')[0]}
                            onChange={(e) => setDateRange(prev => ({
                              ...prev,
                              endDate: new Date(e.target.value)
                            }))}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Button
                            variant="contained"
                            startIcon={<Refresh />}
                            onClick={() => {
                              setSelectedSensorFilter('all');
                              setDateRange({
                                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                                endDate: new Date()
                              });
                            }}
                            fullWidth
                            sx={{ mt: 2 }}
                          >
                            Reset
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Reports Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={reportsTab} onChange={(e, newValue) => setReportsTab(newValue)}>
                      <Tab label="Overview" />
                      <Tab label="Sensor Statistics" />
                      <Tab label="Data Table" />
                      <Tab label="Trends" />
                    </Tabs>
                  </Box>

                  {/* Overview Tab */}
                  {reportsTab === 0 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                            {sensors.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Sensors
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                            {alerts.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Alerts
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h3" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                            {getFilteredReadings().length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Filtered Readings
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                          <Chip 
                            icon={isRunning ? <PlayArrow /> : <Stop />}
                            label={isRunning ? 'Running' : 'Stopped'}
                            color={isRunning ? 'success' : 'error'}
                            sx={{ fontSize: '1.2rem', py: 2 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Simulation Status
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  )}

                  {/* Sensor Statistics Tab */}
                  {reportsTab === 1 && (
                    <Grid container spacing={3}>
                      {Object.values(getSensorStatistics()).map((stats, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Thermostat color="primary" />
                                {stats.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                📍 {stats.location}
                              </Typography>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f0f9ff', borderRadius: 1 }}>
                                    <Typography variant="h6" sx={{ color: '#3b82f6' }}>
                                      {stats.avgTemp}°C
                                    </Typography>
                                    <Typography variant="caption">Avg Temp</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6}>
                                  <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f0fdf4', borderRadius: 1 }}>
                                    <Typography variant="h6" sx={{ color: '#3b82f6' }}>
                                      {stats.avgHumidity}%
                                    </Typography>
                                    <Typography variant="caption">Avg Humidity</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="caption" color="text.secondary">Min Temp</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {stats.minTemp}°C
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="caption" color="text.secondary">Max Temp</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {stats.maxTemp}°C
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="caption" color="text.secondary">Alerts</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                                    {stats.alertCount}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {/* Data Table Tab */}
                  {reportsTab === 2 && (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Sensor Readings Data
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Sensor</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Temperature</TableCell>
                                <TableCell>Humidity</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Timestamp</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {getFilteredReadings().slice(0, 50).map((reading, index) => {
                                const sensor = sensors.find(s => s.id === reading.sensorId);
                                const statusColor = getStatusColor(sensor, reading);
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{sensor?.name || 'Unknown'}</TableCell>
                                    <TableCell>{sensor?.location || 'Unknown'}</TableCell>
                                    <TableCell>{reading.temperature}°C</TableCell>
                                    <TableCell>{reading.humidity}%</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={statusColor === '#3b82f6' ? 'Normal' : 'Alert'}
                                        color={statusColor === '#3b82f6' ? 'primary' : 'error'}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {new Date(reading.timestamp?.toDate?.() || reading.timestamp).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Trends Tab */}
                  {reportsTab === 3 && (
                    <Grid container spacing={3}>
                      {sensors.map(sensor => {
                        const chartData = getChartData(sensor.id);
                        return (
                          <Grid item xs={12} md={6} key={sensor.id}>
                            <Card>
                              <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                  {sensor.name} - Temperature & Humidity Trends
                                </Typography>
                                {chartData.length > 1 ? (
                                  <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Line 
                                          type="monotone" 
                                          dataKey="temperature" 
                                          stroke="#3b82f6" 
                                          strokeWidth={2}
                                          name="Temperature (°C)"
                                        />
                                        <Line 
                                          type="monotone" 
                                          dataKey="humidity" 
                                          stroke="#06b6d4" 
                                          strokeWidth={2}
                                          name="Humidity (%)"
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </Box>
                                ) : (
                                  <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      No data available for trends
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Box>
              </TabPanel>
              
              <TabPanel value={activeTab} index={3}>
                {/* Settings Management */}
                <Box>
                  <Typography variant="h4" sx={{ mb: 3, color: '#1f2937', fontWeight: 'bold' }}>
                    ⚙️ Sensor Settings
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {sensors.map((sensor) => (
                      <Grid item xs={12} md={6} key={sensor.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6">
                                {editingSensor?.id === sensor.id ? (
                                  <TextField
                                    value={editFormData.name || ''}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                    size="small"
                                    variant="outlined"
                                  />
                                ) : (
                                  sensor.name
                                )}
                              </Typography>
                              <Box>
                                {editingSensor?.id === sensor.id ? (
                                  <>
                                    <IconButton
                                      size="small"
                                      onClick={handleSaveSensor}
                                      color="primary"
                                    >
                                      <Save />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={handleCancelEdit}
                                      color="error"
                                    >
                                      <Cancel />
                                    </IconButton>
                                  </>
                                ) : (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditSensor(sensor)}
                                    color="primary"
                                  >
                                    <Edit />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              📍 {editingSensor?.id === sensor.id ? (
                                <TextField
                                  value={editFormData.location || ''}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                                  size="small"
                                  variant="outlined"
                                  fullWidth
                                />
                              ) : (
                                sensor.location
                              )}
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Temperature Range:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                {editingSensor?.id === sensor.id ? (
                                  <>
                                    <TextField
                                      label="Min Temp"
                                      type="number"
                                      value={editFormData.acceptableTempMin || ''}
                                      onChange={(e) => setEditFormData(prev => ({ 
                                        ...prev, 
                                        acceptableTempMin: parseFloat(e.target.value) 
                                      }))}
                                      size="small"
                                      sx={{ width: 100 }}
                                    />
                                    <Typography variant="body2">to</Typography>
                                    <TextField
                                      label="Max Temp"
                                      type="number"
                                      value={editFormData.acceptableTempMax || ''}
                                      onChange={(e) => setEditFormData(prev => ({ 
                                        ...prev, 
                                        acceptableTempMax: parseFloat(e.target.value) 
                                      }))}
                                      size="small"
                                      sx={{ width: 100 }}
                                    />
                                    <Typography variant="body2">°C</Typography>
                                  </>
                                ) : (
                                  <Typography variant="body2">
                                    {sensor.acceptableTempMin}°C - {sensor.acceptableTempMax}°C
                                  </Typography>
                                )}
                              </Box>
                              
                              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Humidity Range:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                {editingSensor?.id === sensor.id ? (
                                  <>
                                    <TextField
                                      label="Min Humidity"
                                      type="number"
                                      value={editFormData.acceptableHumidityMin || ''}
                                      onChange={(e) => setEditFormData(prev => ({ 
                                        ...prev, 
                                        acceptableHumidityMin: parseFloat(e.target.value) 
                                      }))}
                                      size="small"
                                      sx={{ width: 100 }}
                                    />
                                    <Typography variant="body2">to</Typography>
                                    <TextField
                                      label="Max Humidity"
                                      type="number"
                                      value={editFormData.acceptableHumidityMax || ''}
                                      onChange={(e) => setEditFormData(prev => ({ 
                                        ...prev, 
                                        acceptableHumidityMax: parseFloat(e.target.value) 
                                      }))}
                                      size="small"
                                      sx={{ width: 100 }}
                                    />
                                    <Typography variant="body2">%</Typography>
                                  </>
                                ) : (
                                  <Typography variant="body2">
                                    {sensor.acceptableHumidityMin}% - {sensor.acceptableHumidityMax}%
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            
                            {editingSensor?.id !== sensor.id && (
                              <Button
                                variant="outlined"
                                onClick={() => handleSettingsOpen(sensor)}
                                size="small"
                                startIcon={<Settings />}
                              >
                                Advanced Settings
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </TabPanel>
            </>
          )}
        </Container>
      </Box>
    </Box>
    
    {/* Settings Dialog */}
    <Dialog open={settingsOpen} onClose={handleSettingsClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sensor Settings</DialogTitle>
      <DialogContent>
        {selectedSensor && (
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedSensor.name}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Min Temperature (°C)"
                  type="number"
                  value={selectedSensor.acceptableTempMin}
                  onChange={(e) => setSelectedSensor({
                    ...selectedSensor,
                    acceptableTempMin: parseFloat(e.target.value)
                  })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Temperature (°C)"
                  type="number"
                  value={selectedSensor.acceptableTempMax}
                  onChange={(e) => setSelectedSensor({
                    ...selectedSensor,
                    acceptableTempMax: parseFloat(e.target.value)
                  })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Min Humidity (%)"
                  type="number"
                  value={selectedSensor.acceptableHumidityMin}
                  onChange={(e) => setSelectedSensor({
                    ...selectedSensor,
                    acceptableHumidityMin: parseFloat(e.target.value)
                  })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Humidity (%)"
                  type="number"
                  value={selectedSensor.acceptableHumidityMax}
                  onChange={(e) => setSelectedSensor({
                    ...selectedSensor,
                    acceptableHumidityMax: parseFloat(e.target.value)
                  })}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSettingsClose}>Cancel</Button>
        <Button onClick={handleUpdateSettings} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>

    {/* Email Dialog */}
    <Dialog open={emailDialogOpen} onClose={handleEmailDialogClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email color="primary" />
          Send Critical Alert Notification
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="To"
                fullWidth
                value={emailForm.to}
                onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subject"
                fullWidth
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message"
                fullWidth
                multiline
                rows={8}
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEmailDialogClose}>Cancel</Button>
        <Button onClick={handleSendEmailSubmit} variant="contained" startIcon={<Email />}>
          Send Email
        </Button>
      </DialogActions>
    </Dialog>
    </div>
  );
}
