// src/components/Toast.jsx

import { useEffect } from 'react';

function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration]);

  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-down">
      <div className="flex items-center">
        <span className="font-semibold">{message}</span>
        <button onClick={onClose} className="ml-4 text-xl font-bold opacity-70 hover:opacity-100">&times;</button>
      </div>
    </div>
  );
}

export default Toast;