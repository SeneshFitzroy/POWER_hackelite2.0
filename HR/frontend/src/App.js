import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employee/EmployeeList';
import EmployeeForm from './components/Employee/EmployeeForm';
import EmployeeProfile from './components/Employee/EmployeeProfile';
import PayrollList from './components/Payroll/PayrollList';
import AttendanceList from './components/Attendance/AttendanceList';
import LicenseTracking from './components/License/LicenseTracking';
import { useAuth } from './contexts/AuthContext';
import './index.css';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees/new" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees/:id" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeProfile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/payroll" element={
              <ProtectedRoute>
                <Layout>
                  <PayrollList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute>
                <Layout>
                  <AttendanceList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/licenses" element={
              <ProtectedRoute>
                <Layout>
                  <LicenseTracking />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;