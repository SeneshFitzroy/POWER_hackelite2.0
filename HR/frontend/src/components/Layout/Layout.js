import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  DollarSign, 
  Clock, 
  Award, 
  BarChart3, 
  Menu, 
  X,
  LogOut,
  Home,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const navigation = [
    { name: 'HR Dashboard', href: '/', icon: Home },
    { name: 'Employee Management', href: '/employees', icon: Users },
    { name: 'Payroll', href: '/payroll', icon: DollarSign },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Licenses', href: '/licenses', icon: Award },
  ];

  const currentDate = new Date();
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-blue-900 transform transition ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-white">COREERP</h1>
            </div>
            <div className="px-4 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                HR MODULE
              </span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg ${
                      location.pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-blue-100 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-70 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-blue-900">
          {/* Header */}
          <div className="p-6 pb-4">
            <h1 className="text-2xl font-bold text-white mb-2">COREERP</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
              HR MODULE
            </span>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      location.pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-blue-700 mx-4"></div>

          {/* Current Date & Time */}
          <div className="p-4 m-4 bg-blue-600 rounded-lg">
            <div className="text-xs text-blue-100 mb-1">CURRENT DATE & TIME</div>
            <div className="text-lg font-bold text-white">
              {currentDate.toLocaleDateString('en-US', dateOptions)}
            </div>
            <div className="text-sm text-blue-100">
              {currentDate.toLocaleTimeString('en-US', timeOptions)}
            </div>
          </div>

          {/* Date Filter */}
          <div className="px-4 pb-4">
            <div className="text-xs text-blue-100 mb-2">DATE FILTER</div>
            <div className="bg-blue-600 rounded-lg p-2 flex items-center justify-between cursor-pointer">
              <span className="text-sm text-white">Daily</span>
              <span className="text-sm text-white">▼</span>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="border-t border-blue-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-100 mr-2" />
                <span className="text-sm text-blue-100">HR User</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-blue-100 hover:text-white p-1 rounded"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-70 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 bg-gray-50">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;