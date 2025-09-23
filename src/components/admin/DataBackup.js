import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Package,
  Shield,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../../firebase/config';
import { 
  collection, 
  getDocs, 
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

const DataBackup = () => {
  const [loading, setLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [backupData, setBackupData] = useState(null);
  const [restoreData, setRestoreData] = useState(null);

  const collections = [
    { name: 'users', icon: Users, description: 'User accounts and profiles' },
    { name: 'medicines', icon: Package, description: 'Medicine inventory data' },
    { name: 'prescriptions', icon: FileText, description: 'Prescription records' },
    { name: 'transactions', icon: Database, description: 'Transaction history' },
    { name: 'suppliers', icon: Shield, description: 'Supplier information' },
    { name: 'employees', icon: Users, description: 'Employee data' },
    { name: 'loginAttempts', icon: Shield, description: 'Security logs' },
    { name: 'legalDocuments', icon: FileText, description: 'Legal documents' }
  ];

  useEffect(() => {
    loadBackupHistory();
  }, []);

  const loadBackupHistory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'backupHistory'));
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by creation date, newest first
      history.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      
      setBackupHistory(history);
    } catch (error) {
      console.error('Error loading backup history:', error);
      toast.error('Failed to load backup history');
    }
  };

  const handleCollectionToggle = (collectionName) => {
    setSelectedCollections(prev => 
      prev.includes(collectionName)
        ? prev.filter(name => name !== collectionName)
        : [...prev, collectionName]
    );
  };

  const selectAllCollections = () => {
    setSelectedCollections(collections.map(c => c.name));
  };

  const deselectAllCollections = () => {
    setSelectedCollections([]);
  };

  const createBackup = async () => {
    if (selectedCollections.length === 0) {
      toast.error('Please select at least one collection to backup');
      return;
    }

    setLoading(true);
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        collections: {},
        metadata: {
          version: '1.0',
          collectionsCount: selectedCollections.length,
          totalDocuments: 0
        }
      };

      let totalDocs = 0;

      // Backup selected collections
      for (const collectionName of selectedCollections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const documents = [];
        
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            data: doc.data()
          });
        });

        backup.collections[collectionName] = documents;
        totalDocs += documents.length;
        
        toast.loading(`Backing up ${collectionName}... (${documents.length} documents)`);
      }

      backup.metadata.totalDocuments = totalDocs;

      // Save backup to history
      await addDoc(collection(db, 'backupHistory'), {
        createdAt: new Date(),
        collections: selectedCollections,
        documentCount: totalDocs,
        type: 'manual',
        status: 'completed',
        size: JSON.stringify(backup).length
      });

      // Download backup file
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupData(backup);
      await loadBackupHistory();
      
      toast.dismiss();
      toast.success(`Backup created successfully! ${totalDocs} documents exported.`);
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.dismiss();
      toast.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Please select a valid JSON backup file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate backup file structure
        if (!data.collections || !data.metadata) {
          toast.error('Invalid backup file format');
          return;
        }

        setRestoreData(data);
        toast.success('Backup file loaded successfully');
      } catch (error) {
        toast.error('Failed to parse backup file');
      }
    };
    
    reader.readAsText(file);
  };

  const restoreFromBackup = async () => {
    if (!restoreData) {
      toast.error('Please upload a backup file first');
      return;
    }

    const confirmed = window.confirm(
      'This will overwrite existing data. Are you sure you want to proceed with the restore?'
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      let restoredDocs = 0;

      // Restore each collection
      for (const [collectionName, documents] of Object.entries(restoreData.collections)) {
        toast.loading(`Restoring ${collectionName}... (${documents.length} documents)`);
        
        // Clear existing collection (optional - comment out if you want to merge)
        const existingDocs = await getDocs(collection(db, collectionName));
        existingDocs.forEach((docRef) => {
          batch.delete(docRef.ref);
        });

        // Restore documents
        documents.forEach((document) => {
          const docRef = doc(db, collectionName, document.id);
          batch.set(docRef, document.data);
          restoredDocs++;
        });
      }

      await batch.commit();

      // Record restore in history
      await addDoc(collection(db, 'backupHistory'), {
        createdAt: new Date(),
        type: 'restore',
        status: 'completed',
        documentCount: restoredDocs,
        collections: Object.keys(restoreData.collections),
        originalBackupDate: restoreData.timestamp
      });

      await loadBackupHistory();
      
      toast.dismiss();
      toast.success(`Data restored successfully! ${restoredDocs} documents restored.`);
      
      setRestoreData(null);
      // Reset file input
      const fileInput = document.getElementById('backup-file-input');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.dismiss();
      toast.error('Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  const scheduleAutoBackup = async () => {
    try {
      await addDoc(collection(db, 'scheduledTasks'), {
        type: 'autoBackup',
        schedule: 'daily',
        collections: collections.map(c => c.name),
        enabled: true,
        createdAt: new Date(),
        lastRun: null
      });
      
      toast.success('Auto backup scheduled successfully');
    } catch (error) {
      console.error('Error scheduling auto backup:', error);
      toast.error('Failed to schedule auto backup');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Data Backup & Restore</h2>
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-500">Database Management</span>
        </div>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Database className="w-8 h-8 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Collections</p>
              <p className="text-lg font-semibold text-gray-900">{collections.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Successful Backups</p>
              <p className="text-lg font-semibold text-gray-900">
                {backupHistory.filter(b => b.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Last Backup</p>
              <p className="text-sm font-semibold text-gray-900">
                {backupHistory.length > 0 
                  ? new Date(backupHistory[0].createdAt.seconds * 1000).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Backup Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Backup</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Select Collections</h4>
            <div className="space-x-2">
              <button
                onClick={selectAllCollections}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={deselectAllCollections}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {collections.map((col) => {
              const IconComponent = col.icon;
              const isSelected = selectedCollections.includes(col.name);
              
              return (
                <div
                  key={col.name}
                  onClick={() => handleCollectionToggle(col.name)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {col.name}
                      </p>
                      <p className="text-xs text-gray-500">{col.description}</p>
                    </div>
                  </div>
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={createBackup}
              disabled={loading || selectedCollections.length === 0}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Creating Backup...' : 'Create Backup'}
            </button>
            
            <button
              onClick={scheduleAutoBackup}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Schedule Auto Backup
            </button>
          </div>
        </div>
      </div>

      {/* Restore Backup Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Restore from Backup</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Backup File
            </label>
            <input
              type="file"
              id="backup-file-input"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          {restoreData && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Backup Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">
                    {new Date(restoreData.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Collections:</span>
                  <span className="ml-2 font-medium">
                    {Object.keys(restoreData.collections).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Documents:</span>
                  <span className="ml-2 font-medium">
                    {restoreData.metadata.totalDocuments}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Version:</span>
                  <span className="ml-2 font-medium">
                    {restoreData.metadata.version}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={restoreFromBackup}
            disabled={loading || !restoreData}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            {loading ? 'Restoring...' : 'Restore Data'}
          </button>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Collections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Size
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {backupHistory.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {backup.createdAt 
                          ? new Date(backup.createdAt.seconds * 1000).toLocaleString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      backup.type === 'manual' 
                        ? 'bg-blue-100 text-blue-800' 
                        : backup.type === 'restore'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.collections ? backup.collections.join(', ') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {backup.documentCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {backup.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                      )}
                      <span className="text-sm text-gray-900">{backup.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.size ? `${(backup.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {backupHistory.length === 0 && (
          <div className="text-center py-12">
            <Database className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No backup history</h3>
            <p className="text-gray-600">Create your first backup to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataBackup;
