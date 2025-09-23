import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Shield, 
  Database, 
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';
import LegalDocEditor from './LegalDocEditor';
import UserManagement from './UserManagement';
import DataBackup from './DataBackup';
import LoginAttempts from './LoginAttempts';
import DataBackup from './DataBackup';
import LoginAttempts from './LoginAttempts';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    loginAttempts: 0,
    legalDocs: 0,
    backups: 0
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load admin statistics
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      // This would typically fetch from your backend
      setStats({
        totalUsers: 156,
        activeUsers: 142,
        blockedUsers: 14,
        loginAttempts: 23,
        legalDocs: 8,
        backups: 12
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
      toast.error('Failed to load admin statistics');
    }
  };

  const adminTabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'legal', name: 'Legal Documents', icon: FileText },
    { id: 'backup', name: 'Data Backup', icon: Database },
    { id: 'security', name: 'Login Attempts', icon: Shield }
  ];

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          change={12}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={CheckCircle}
          color="bg-green-500"
          change={8}
        />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={XCircle}
          color="bg-red-500"
          change={-3}
        />
        <StatCard
          title="Failed Logins (24h)"
          value={stats.loginAttempts}
          icon={AlertTriangle}
          color="bg-yellow-500"
          change={-15}
        />
        <StatCard
          title="Legal Documents"
          value={stats.legalDocs}
          icon={FileText}
          color="bg-purple-500"
          change={2}
        />
        <StatCard
          title="Data Backups"
          value={stats.backups}
          icon={Database}
          color="bg-indigo-500"
          change={0}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">New user registration: john.doe@example.com</span>
            </div>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Failed login attempt from IP: 192.168.1.100</span>
            </div>
            <span className="text-xs text-gray-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Legal document updated: Privacy Policy</span>
            </div>
            <span className="text-xs text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your ERP system</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-md p-4">
              <ul className="space-y-2">
                {adminTabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'legal' && <LegalDocEditor />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'security' && <LoginAttempts />}
            {activeTab === 'backup' && <DataBackup />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
