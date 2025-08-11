import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { removeNotification } from '../store/slices/uiSlice';

const AUTO_DISMISS_MS = 3000;

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.ui.notifications);

  useEffect(() => {
    const timers = notifications.map(n =>
      setTimeout(() => dispatch(removeNotification(n.id)), AUTO_DISMISS_MS)
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 space-y-2 z-50">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`px-4 py-2 rounded shadow-md border text-white ${
            n.type === 'success' ? 'bg-green-600 border-green-700' :
            n.type === 'error' ? 'bg-red-600 border-red-700' :
            'bg-gray-800 border-gray-900'
          }`}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
