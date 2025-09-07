import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Paper,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  People,
  Work,
  Schedule,
  AttachMoney,
  TrendingUp,
  Warning,
  Add,
  Refresh,
  Assessment
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { initializeFirestore } from '../../../utils/hr/initializeFirestore';
import InitializeData from '../Setup/InitializeData';

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
      color: 'bg-blue-500',
      link: '/employees'
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/employees'
    },
    {
      title: 'Pending Payroll',
      value: stats.pendingPayroll,
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/payroll'
    },
    {
      title: 'Expiring Licenses',
      value: stats.expiringLicenses,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/licenses'
    },
    {
      title: 'Today Attendance',
      value: stats.todayAttendance,
      icon: Clock,
      color: 'bg-purple-500',
      link: '/attendance'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: FileText,
      color: 'bg-indigo-500',
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 ml-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Add New Employee
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorMap = {
            'bg-blue-500': { bg: 'bg-blue-100', text: 'text-blue-600' },
            'bg-green-500': { bg: 'bg-green-100', text: 'text-green-600' },
            'bg-yellow-500': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            'bg-red-500': { bg: 'bg-red-100', text: 'text-red-600' },
            'bg-purple-500': { bg: 'bg-purple-100', text: 'text-purple-600' },
            'bg-indigo-500': { bg: 'bg-indigo-100', text: 'text-indigo-600' }
          };
          const colors = colorMap[stat.color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
          
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${colors.bg} rounded-xl p-3`}>
                      <Icon className={`h-8 w-8 ${colors.text}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-600 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 mt-8">
        <div className="px-6 py-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                >
                  <Icon className="h-6 w-6 text-gray-400 group-hover:text-blue-600 mr-4" />
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                    {action.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Database Setup */}
      {stats.totalEmployees === 0 && (
        <InitializeData />
      )}

      {/* Recent Activity */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 mt-8">
        <div className="px-6 py-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center text-sm p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-4"></div>
              <span className="text-gray-700 flex-1">New employee John Doe added to system</span>
              <span className="text-gray-400 text-xs">2 hours ago</span>
            </div>
            <div className="flex items-center text-sm p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-4"></div>
              <span className="text-gray-700 flex-1">Pharmacist license for Jane Smith expires in 15 days</span>
              <span className="text-gray-400 text-xs">1 day ago</span>
            </div>
            <div className="flex items-center text-sm p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-4"></div>
              <span className="text-gray-700 flex-1">Monthly payroll processed for 25 employees</span>
              <span className="text-gray-400 text-xs">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;