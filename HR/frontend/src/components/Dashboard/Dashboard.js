import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { db } from '../../firebase/config';
import { initializeFirestore } from '../../utils/initializeFirestore';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-gray-600">New employee John Doe added to system</span>
              <span className="ml-auto text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-gray-600">Pharmacist license for Jane Smith expires in 15 days</span>
              <span className="ml-auto text-gray-400">1 day ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span className="text-gray-600">Monthly payroll processed for 25 employees</span>
              <span className="ml-auto text-gray-400">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;