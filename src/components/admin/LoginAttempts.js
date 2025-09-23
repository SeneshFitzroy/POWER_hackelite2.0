import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Clock,
  Filter,
  Search,
  Eye,
  Ban
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore';

const LoginAttempts = () => {
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    loadLoginAttempts();
  }, [dateFilter]);

  const loadLoginAttempts = async () => {
    try {
      setLoading(true);
      let loginQuery = query(
        collection(db, 'loginAttempts'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          loginQuery = query(
            collection(db, 'loginAttempts'),
            where('timestamp', '>=', startDate),
            orderBy('timestamp', 'desc'),
            limit(100)
          );
        }
      }

      const querySnapshot = await getDocs(loginQuery);
      const attempts = [];
      querySnapshot.forEach((doc) => {
        attempts.push({ id: doc.id, ...doc.data() });
      });
      
      setLoginAttempts(attempts);
    } catch (error) {
      console.error('Error loading login attempts:', error);
      toast.error('Failed to load login attempts');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async (ipAddress) => {
    try {
      // Add to blocked IPs collection
      await addDoc(collection(db, 'blockedIPs'), {
        ipAddress,
        blockedAt: new Date(),
        reason: 'Multiple failed login attempts',
        status: 'active'
      });
      
      toast.success(`IP address ${ipAddress} has been blocked`);
    } catch (error) {
      console.error('Error blocking IP:', error);
      toast.error('Failed to block IP address');
    }
  };

  const getStatusIcon = (success) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getDeviceIcon = (device) => {
    return device?.toLowerCase().includes('mobile') ? (
      <Smartphone className="w-4 h-4 text-gray-500" />
    ) : (
      <Monitor className="w-4 h-4 text-gray-500" />
    );
  };

  const getRiskLevel = (attempt) => {
    let risk = 0;
    
    // Failed login increases risk
    if (!attempt.success) risk += 2;
    
    // Multiple attempts from same IP
    const sameIPAttempts = loginAttempts.filter(a => a.ipAddress === attempt.ipAddress);
    if (sameIPAttempts.length > 5) risk += 3;
    
    // Unusual location or device
    if (attempt.location && attempt.location !== 'Known Location') risk += 1;
    
    if (risk >= 4) return { level: 'high', color: 'text-red-600', bg: 'bg-red-100' };
    if (risk >= 2) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const filteredAttempts = loginAttempts.filter(attempt => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!attempt.email?.toLowerCase().includes(searchLower) && 
          !attempt.ipAddress?.includes(searchLower) &&
          !attempt.userAgent?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'success' && !attempt.success) return false;
      if (statusFilter === 'failed' && attempt.success) return false;
      if (statusFilter === 'blocked' && !attempt.blocked) return false;
    }
    
    return true;
  });

  const AttemptDetailsModal = ({ attempt, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Login Attempt Details</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{attempt.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1 flex items-center space-x-2">
                  {getStatusIcon(attempt.success)}
                  <span className={attempt.success ? 'text-green-600' : 'text-red-600'}>
                    {attempt.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <p className="mt-1 text-sm text-gray-900">{attempt.ipAddress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                <p className="mt-1 text-sm text-gray-900">
                  {attempt.timestamp ? new Date(attempt.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-sm text-gray-900">{attempt.location || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevel(attempt).bg} ${getRiskLevel(attempt).color}`}>
                  {getRiskLevel(attempt).level.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">User Agent</label>
              <p className="mt-1 text-sm text-gray-900 break-all">{attempt.userAgent || 'N/A'}</p>
            </div>
            
            {attempt.errorMessage && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Error Message</label>
                <p className="mt-1 text-sm text-red-600">{attempt.errorMessage}</p>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBlockIP(attempt.ipAddress)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  <Ban className="w-4 h-4 inline mr-1" />
                  Block IP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Login Attempts</h2>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-500">Security Monitoring</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Successful</p>
              <p className="text-lg font-semibold text-gray-900">
                {loginAttempts.filter(a => a.success).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-lg font-semibold text-gray-900">
                {loginAttempts.filter(a => !a.success).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">High Risk</p>
              <p className="text-lg font-semibold text-gray-900">
                {loginAttempts.filter(a => getRiskLevel(a).level === 'high').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Unique IPs</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Set(loginAttempts.map(a => a.ipAddress)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by email, IP, or user agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="success">Successful</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Login Attempts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttempts.map((attempt) => {
                const risk = getRiskLevel(attempt);
                return (
                  <tr key={attempt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(attempt.success)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attempt.email || 'Anonymous'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{attempt.ipAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getDeviceIcon(attempt.userAgent)}
                        <span className="ml-2 text-sm text-gray-500">
                          {attempt.userAgent ? attempt.userAgent.split(' ')[0] : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">
                          {attempt.timestamp 
                            ? new Date(attempt.timestamp.seconds * 1000).toLocaleString()
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${risk.bg} ${risk.color}`}>
                        {risk.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedAttempt(attempt)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBlockIP(attempt.ipAddress)}
                          className="text-red-600 hover:text-red-900"
                          title="Block IP"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAttempts.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No login attempts found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No login attempts recorded yet.'
              }
            </p>
          </div>
        )}
      </div>

      {selectedAttempt && (
        <AttemptDetailsModal
          attempt={selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
        />
      )}
    </div>
  );
};

export default LoginAttempts;
