import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Container,
  Avatar,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  People,
  AccessTime
} from '@mui/icons-material';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AttendanceList = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly
  const [markingAttendance, setMarkingAttendance] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch employees
      const employeesSnapshot = await getDocs(
        query(collection(db, 'employees'), where('status', '==', 'active'))
      );
      const employeeData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);

      // Fetch attendance for selected date range
      let startDate, endDate;
      if (viewMode === 'weekly') {
        const date = new Date(selectedDate);
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // End of week (Saturday)
        startDate = format(start, 'yyyy-MM-dd');
        endDate = format(end, 'yyyy-MM-dd');
      } else {
        startDate = endDate = selectedDate;
      }

      const attendanceSnapshot = await getDocs(
        query(
          collection(db, 'attendance'),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'desc')
        )
      );
      
      const attendanceData = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAttendance = async (employeeId, status, timeIn = null, timeOut = null) => {
    setMarkingAttendance(true);
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      const attendanceRecord = {
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        date: selectedDate,
        status, // present, absent, late, half-day
        timeIn,
        timeOut,
        hoursWorked: timeIn && timeOut ? calculateHours(timeIn, timeOut) : 0,
        createdAt: new Date().toISOString(),
        markedBy: 'current-user' // This would be the logged-in user
      };

      await addDoc(collection(db, 'attendance'), attendanceRecord);
      toast.success(`Attendance marked for ${employee.firstName} ${employee.lastName}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const calculateHours = (timeIn, timeOut) => {
    const start = new Date(`2000-01-01T${timeIn}`);
    const end = new Date(`2000-01-01T${timeOut}`);
    return (end - start) / (1000 * 60 * 60); // Convert to hours
  };

  const getAttendanceForEmployee = (employeeId, date) => {
    return attendance.find(att => att.employeeId === employeeId && att.date === date);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
      absent: { color: 'error', icon: <Cancel sx={{ fontSize: 16 }} /> },
      late: { color: 'warning', icon: <Schedule sx={{ fontSize: 16 }} /> },
      'half-day': { color: 'info', icon: <AccessTime sx={{ fontSize: 16 }} /> }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: <Schedule sx={{ fontSize: 16 }} /> };
    
    return (
      <Chip
        icon={config.icon}
        label={status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        color={config.color}
        size="small"
        sx={{ fontWeight: 'medium' }}
      />
    );
  };

  const getDailyStats = () => {
    const todayAttendance = attendance.filter(att => att.date === selectedDate);
    return {
      present: todayAttendance.filter(att => att.status === 'present').length,
      absent: employees.length - todayAttendance.length,
      late: todayAttendance.filter(att => att.status === 'late').length,
      total: employees.length
    };
  };

  const MetricCard = ({ title, value, icon, color }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${color}25`
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '50%',
              backgroundColor: `${color}20`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            color: color,
            mb: 1 
          }}
        >
          {value}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 'medium',
            textTransform: 'capitalize'
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderDailyView = () => {
    const stats = getDailyStats();
    
    return (
      <Box sx={{ space: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Present"
              value={stats.present}
              icon={<CheckCircle sx={{ fontSize: 28 }} />}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Absent"
              value={stats.absent}
              icon={<Cancel sx={{ fontSize: 28 }} />}
              color="#ef4444"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Late"
              value={stats.late}
              icon={<Schedule sx={{ fontSize: 28 }} />}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total"
              value={stats.total}
              icon={<People sx={{ fontSize: 28 }} />}
              color="#1e3a8a"
            />
          </Grid>
        </Grid>

        {/* Attendance Table */}
        <Paper 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}
        >
          <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: '#1e3a8a'
              }}
            >
              Attendance for {new Date(selectedDate).toLocaleDateString()}
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Time In</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Time Out</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Hours</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => {
                  const attendanceRecord = getAttendanceForEmployee(employee.id, selectedDate);
                  
                  return (
                    <TableRow 
                      key={employee.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f8fafc' 
                        },
                        '&:last-child td': { 
                          borderBottom: 0 
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: '#1e3a8a',
                              fontSize: '12px',
                              mr: 2
                            }}
                          >
                            {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {employee.role}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {attendanceRecord ? (
                          getStatusBadge(attendanceRecord.status)
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not marked
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {attendanceRecord?.timeIn || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {attendanceRecord?.timeOut || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {attendanceRecord?.hoursWorked ? `${attendanceRecord.hoursWorked.toFixed(1)}h` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {!attendanceRecord && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => markAttendance(employee.id, 'present', '09:00', '17:00')}
                              disabled={markingAttendance}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '12px'
                              }}
                            >
                              Present
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => markAttendance(employee.id, 'absent')}
                              disabled={markingAttendance}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '12px'
                              }}
                            >
                              Absent
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => markAttendance(employee.id, 'late', '09:30', '17:00')}
                              disabled={markingAttendance}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '12px'
                              }}
                            >
                              Late
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress size={60} sx={{ color: '#1e3a8a' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            color: '#1e3a8a',
            mb: 2
          }}
        >
          Attendance Management
        </Typography>
        
        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>View Type</InputLabel>
            <Select
              value={viewMode}
              label="View Type"
              onChange={(e) => setViewMode(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="daily">Daily View</MenuItem>
              <MenuItem value="weekly">Weekly View</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2 
              }
            }}
          />
        </Box>
      </Box>

      {viewMode === 'daily' && renderDailyView()}
    </Container>
  );
};

export default AttendanceList;

export default AttendanceList;