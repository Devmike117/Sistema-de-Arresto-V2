import React, { useEffect, useState } from "react";

export default function Notification({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      // Pequeño delay para trigger la animación de entrada
      setTimeout(() => setIsVisible(true), 10);

      const timer = setTimeout(() => {
        handleClose();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onClose();
    }, 300);
  };

  if (!message) return null;

  const getNotificationStyle = () => {
    const baseStyle = {
      ...styles.notification,
      ...(isVisible && !isExiting ? styles.notificationVisible : {}),
      ...(isExiting ? styles.notificationExiting : {})
    };

    if (message.type === 'success') {
      return { ...baseStyle, ...styles.success };
    } else if (message.type === 'error') {
      return { ...baseStyle, ...styles.error };
    } else if (message.type === 'warning') {
      return { ...baseStyle, ...styles.warning };
    } else {
      return { ...baseStyle, ...styles.info };
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <span className="material-symbols-outlined" style={{ color: '#0bff85ff' }}>check_circle</span>;
      case 'error':
        return <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>cancel</span>;
      case 'warning':
        return <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>warning</span>;
      default:
        return <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>info</span>;
    }
  };

  return (
    <div style={getNotificationStyle()}>
      <div style={styles.iconContainer}>
        <span style={styles.icon}>{getIcon()}</span>
      </div>
      <span style={styles.message}>{message.text}</span>
      <button 
        onClick={handleClose} 
        style={styles.closeButton}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        ✖
      </button>
    </div>
  );
}

const styles = {
  notification: {
    position: 'fixed',
    top: '2rem',
    right: '2rem',
    zIndex: 9999,
    minWidth: '300px',
    maxWidth: '500px',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    transform: 'translateX(120%)',
    opacity: 0,
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  notificationVisible: {
    transform: 'translateX(0)',
    opacity: 1
  },

  notificationExiting: {
    transform: 'translateX(120%)',
    opacity: 0
  },

  success: {
    background: 'linear-gradient(135deg, rgba(79, 212, 102, 0.2) 0%, rgba(67, 185, 89, 0.2) 100%)',
    borderColor: 'rgba(79, 212, 102, 0.4)'
  },

  error: {
    background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.2) 0%, rgba(220, 50, 73, 0.2) 100%)',
    borderColor: 'rgba(245, 87, 108, 0.4)'
  },

  warning: {
    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)',
    borderColor: 'rgba(255, 193, 7, 0.4)'
  },

  info: {
    background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%)',
    borderColor: 'rgba(79, 172, 254, 0.4)'
  },

  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.2)',
    flexShrink: 0
  },

  icon: {
    fontSize: '1.5rem',
    color: '#fff',
    fontWeight: 'bold'
  },

  message: {
    flex: 1,
    fontSize: '0.95rem',
    color: '#fff',
    fontWeight: '500',
    lineHeight: '1.4'
  },

  closeButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '0.9rem',
    opacity: 0.7,
    transition: 'all 0.2s ease',
    flexShrink: 0,
    outline: 'none'
  }
};