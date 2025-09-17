'use client'

import React from 'react';
import { useNotifications } from '../../components/ui/notification-context';
import { Button } from '../../components/ui/button';

export default function TestNotificationsPage() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Notifications</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={() => showSuccess('This is a success message!')}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Show Success
          </Button>
          
          <Button 
            onClick={() => showError('This is an error message!')}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Show Error
          </Button>
          
          <Button 
            onClick={() => showWarning('This is a warning message!')}
            className="w-full bg-yellow-500 hover:bg-yellow-600"
          >
            Show Warning
          </Button>
          
          <Button 
            onClick={() => showInfo('This is an info message!')}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Show Info
          </Button>
          
          <Button 
            onClick={() => {
              showSuccess('Success message');
              setTimeout(() => showError('Error message'), 500);
              setTimeout(() => showWarning('Warning message'), 1000);
              setTimeout(() => showInfo('Info message'), 1500);
            }}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            Show Multiple
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Click the buttons above to test different notification types.</p>
          <p>Notifications will appear in the top-right corner and auto-dismiss after 5 seconds.</p>
        </div>
      </div>
    </div>
  );
} 