import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Container,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccessTime as ClockIcon,
  People as PeopleIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { db } from '../../../firebase/config';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AttendanceList = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('daily');
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [bulkMarkOpen, setBulkMarkOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
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
        start.setDate(date.getDate() - date.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
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

  const markAttendance = async (employeeId, status, time = null) => {
    try {
      setMarkingAttendance(true);
      const attendanceRecord = {
        employeeId,
        date: selectedDate,
        status,
        time: time || new Date().toISOString(),
        markedAt: new Date().toISOString(),
        markedBy: 'current_user' // Replace with actual user
      };

      await addDoc(collection(db, 'attendance'), attendanceRecord);
      toast.success(`Attendance marked as ${status}`);
      fetchData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const getAttendanceStatus = (employeeId, date) => {
    return attendance.find(att => 
      att.employeeId === employeeId && att.date === date
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'half-day': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return <CheckIcon fontSize="small" />;
      case 'absent': return <CancelIcon fontSize="small" />;
      case 'late': return <ClockIcon fontSize="small" />;
      default: return <ClockIcon fontSize="small" />;
    }
  };

  const todayAttendance = attendance.filter(att => att.date === selectedDate);
  const presentCount = todayAttendance.filter(att => att.status === 'present').length;
  const absentCount = todayAttendance.filter(att => att.status === 'absent').length;
  const lateCount = todayAttendance.filter(att => att.status === 'late').length;

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress size={60} sx={{ color: '#1e3a8a' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScheduleIcon sx={{ fontSize: 32, color: '#1e3a8a', mr: 2 }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#1e3a8a',
              letterSpacing: '0.5px'
            }}
          >
            Attendance Management
          </Typography>
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b7280', 
            mb: 3,
            fontSize: '1.1rem'
          }}
        >
          Track and manage employee attendance records
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckIcon sx={{ mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {presentCount}
                  </Typography>
                </Box>
                <Typography variant="body2">Present Today</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CancelIcon sx={{ mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {absentCount}
                  </Typography>
                </Box>
                <Typography variant="body2">Absent Today</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ClockIcon sx={{ mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {lateCount}
                  </Typography>
                </Box>
                <Typography variant="body2">Late Today</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {employees.length}
                  </Typography>
                </Box>
                <Typography variant="body2">Total Employees</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Controls Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Select Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#1e3a8a',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e3a8a',
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>View Mode</InputLabel>
              <Select
                value={viewMode}
                label="View Mode"
                onChange={(e) => setViewMode(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1e3a8a',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1e3a8a',
                  }
                }}
              >
                <MenuItem value="daily">Daily View</MenuItem>
                <MenuItem value="weekly">Weekly View</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<CalendarIcon />}
              fullWidth
              onClick={() => setBulkMarkOpen(true)}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                borderColor: '#1e3a8a',
                color: '#1e3a8a',
                '&:hover': {
                  backgroundColor: '#eff6ff',
                  borderColor: '#1e40af'
                }
              }}
            >
              Bulk Mark
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<TodayIcon />}
              fullWidth
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                }
              }}
            >
              Today
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
            Attendance for {new Date(selectedDate).toLocaleDateString()}
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => {
                const attendanceRecord = getAttendanceStatus(employee.id, selectedDate);
                return (
                  <TableRow 
                    key={employee.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: '#1e3a8a',
                            width: 40,
                            height: 40
                          }}
                        >
                          {`${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {`${employee.firstName || ''} ${employee.lastName || ''}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {employee.employeeId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {attendanceRecord ? (
                        <Chip
                          icon={getStatusIcon(attendanceRecord.status)}
                          label={attendanceRecord.status}
                          color={getStatusColor(attendanceRecord.status)}
                          variant="filled"
                        />
                      ) : (
                        <Chip
                          label="Not Marked"
                          variant="outlined"
                          sx={{ color: '#6b7280' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {attendanceRecord 
                          ? new Date(attendanceRecord.time).toLocaleTimeString()
                          : '-'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {!attendanceRecord ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => markAttendance(employee.id, 'present')}
                            disabled={markingAttendance}
                            sx={{ minWidth: 80 }}
                          >
                            Present
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => markAttendance(employee.id, 'absent')}
                            disabled={markingAttendance}
                            sx={{ minWidth: 80 }}
                          >
                            Absent
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            onClick={() => markAttendance(employee.id, 'late')}
                            disabled={markingAttendance}
                            sx={{ minWidth: 80 }}
                          >
                            Late
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Marked
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {employees.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
              No employees found
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Add employees to start tracking attendance
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Bulk Mark Dialog */}
      <Dialog open={bulkMarkOpen} onClose={() => setBulkMarkOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Mark Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: '#6b7280' }}>
            Mark attendance for all employees at once for {new Date(selectedDate).toLocaleDateString()}
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                employees.forEach(emp => {
                  if (!getAttendanceStatus(emp.id, selectedDate)) {
                    markAttendance(emp.id, 'present');
                  }
                });
                setBulkMarkOpen(false);
              }}
            >
              Mark All Present
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                employees.forEach(emp => {
                  if (!getAttendanceStatus(emp.id, selectedDate)) {
                    markAttendance(emp.id, 'absent');
                  }
                });
                setBulkMarkOpen(false);
              }}
            >
              Mark All Absent
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkMarkOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceList;

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
    const statusClasses = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      'half-day': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
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

  const renderDailyView = () => {
    const stats = getDailyStats();
    
    return (
      <div className="space-y-6 ml-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Attendance for {new Date(selectedDate).toLocaleDateString()}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => {
                  const attendanceRecord = getAttendanceForEmployee(employee.id, selectedDate);
                  
                  return (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employee.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendanceRecord ? (
                          getStatusBadge(attendanceRecord.status)
                        ) : (
                          <span className="text-sm text-gray-500">Not marked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendanceRecord?.timeIn || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendanceRecord?.timeOut || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendanceRecord?.hoursWorked ? `${attendanceRecord.hoursWorked.toFixed(1)}h` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!attendanceRecord && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => markAttendance(employee.id, 'present', '09:00', '17:00')}
                              disabled={markingAttendance}
                              className="text-green-600 hover:text-green-900"
                            >
                              Present
                            </button>
                            <button
                              onClick={() => markAttendance(employee.id, 'absent')}
                              disabled={markingAttendance}
                              className="text-red-600 hover:text-red-900"
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => markAttendance(employee.id, 'late', '09:30', '17:00')}
                              disabled={markingAttendance}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Late
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 ml-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <div className="flex items-center space-x-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="input"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {viewMode === 'daily' && renderDailyView()}
    </div>
  );
};

export default AttendanceList;