'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from './notification';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(({ message, type = 'info', duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const newNotification = { id, message, type, duration };
    
    console.log('Notification: Adding notification:', newNotification);
    setNotifications(prev => {
      const newNotifications = [...prev, newNotification];
      console.log('Notification: Total notifications:', newNotifications.length);
      return newNotifications;
    });
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    console.log('Notification: Showing success message:', message);
    return addNotification({ message, type: 'success', duration });
  }, [addNotification]);

  const showError = useCallback((message, duration) => {
    return addNotification({ message, type: 'error', duration });
  }, [addNotification]);

  const showWarning = useCallback((message, duration) => {
    return addNotification({ message, type: 'warning', duration });
  }, [addNotification]);

  const showInfo = useCallback((message, duration) => {
    return addNotification({ message, type: 'info', duration });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ transform: `translateY(${index * 80}px)` }}
            className="transition-transform duration-300"
          >
            <Notification
              message={notification.message}
              type={notification.type}
              duration={notification.duration}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 