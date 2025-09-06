import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Clock, Users, CheckCircle, XCircle } from 'lucide-react';
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
      <div className="space-y-6">
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
    <div className="space-y-6">
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