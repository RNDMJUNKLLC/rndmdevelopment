import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@store/index';
import { uiActions } from '@store/slices/uiSlice';

export const NotificationContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Auto-remove notifications after their duration
    notifications.forEach((notification) => {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        dispatch(uiActions.removeNotification(notification.id));
      }, duration);

      return () => clearTimeout(timer);
    });
  }, [notifications, dispatch]);

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            px-6 py-3 rounded-lg shadow-lg animate-fade-in
            ${getNotificationStyles(notification.type)}
            flex items-center justify-between gap-4 min-w-max
          `}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => dispatch(uiActions.removeNotification(notification.id))}
            className="text-lg font-bold hover:opacity-75 transition"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
