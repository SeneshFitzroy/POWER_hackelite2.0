import React, { useState } from 'react';
import { Database, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const InitializeData = () => {
  const [initializing, setInitializing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      toast.info('Data initialization has been disabled to prevent automatic data creation. Please add data manually through the forms.');
    } catch (error) {
      console.error('Initialization error:', error);
      toast.error('Error during initialization');
    } finally {
      setInitializing(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setResetting(true);
      try {
        const success = await resetFirestore();
        if (success) {
          toast.success('Database reset and reinitialized successfully!');
        } else {
          toast.error('Failed to reset database');
        }
      } catch (error) {
        console.error('Reset error:', error);
        toast.error('Error during reset');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Database className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Database Setup</h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Initialize Sample Data</h4>
          <p className="text-sm text-blue-700 mb-3">
            This will create sample employees, attendance records, payroll data, and performance reviews 
            to help you get started with the HR system.
          </p>
          <button
            onClick={handleInitialize}
            disabled={initializing}
            className="btn-primary flex items-center"
          >
            {initializing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Initialize Sample Data
              </>
            )}
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900 mb-2">Reset All Data</h4>
              <p className="text-sm text-red-700 mb-3">
                This will delete all existing data and reinitialize with fresh sample data. 
                Use this only for testing purposes.
              </p>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="btn-danger flex items-center"
              >
                {resetting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reset All Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-medium mb-2">Sample Data Includes:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>3 Sample employees with different roles and statuses</li>
          <li>Professional licenses with expiry tracking</li>
          <li>Recent attendance records</li>
          <li>Current month payroll data</li>
          <li>Performance review templates</li>
        </ul>
      </div>
    </div>
  );
};

export default InitializeData;