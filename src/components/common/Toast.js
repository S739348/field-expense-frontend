import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type, onClose, autoClose = true }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && type === 'success') {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, type, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`toast-overlay ${visible ? 'visible' : ''}`}>
      <div className={`toast toast-${type}`}>
        <div className="toast-content">
          <span>{message}</span>
          {type === 'error' && (
            <button className="toast-close" onClick={handleClose}>
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast;
