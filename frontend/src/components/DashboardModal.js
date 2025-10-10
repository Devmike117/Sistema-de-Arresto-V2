import React, { useEffect } from 'react';

export default function DashboardModal({ title, data, onClose, renderItem }) {
  if (!data) return null;

  // 🔹 Inserta las animaciones al cargar el componente
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          backdrop-filter: blur(0px);
        }
        to {
          opacity: 1;
          backdrop-filter: blur(6px);
        }
      }

      @keyframes slideDown {
        from {
          transform: translateY(-60px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {data.length === 0 ? (
            <p style={styles.emptyText}>No hay datos para mostrar.</p>
          ) : (
            <ul style={styles.list}>
              {data.map((item, index) => (
                <li key={index} style={styles.listItem}>
                  {renderItem(item, index)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center', // Centrado horizontal
    alignItems: 'flex-start', // 🔹 Aparece arriba
    zIndex: 1000,
    paddingTop: '3rem', // 🔹 Margen superior del modal
    animation: 'fadeIn 0.4s ease forwards',
    overflowY: 'auto',
  },
  modal: {
    background: 'rgba(30, 30, 60, 0.7)',
    backdropFilter: 'blur(25px)',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '950px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#fff',
    animation: 'slideDown 0.5s ease forwards',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.8rem 2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  },
  title: {
    fontSize: '1.9rem',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '0.5px',
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    transition: 'all 0.25s ease',
  },
  content: {
    padding: '1.8rem 2rem',
    overflowY: 'auto',
    flex: 1,
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255,255,255,0.4) transparent',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  listItem: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '1.2rem 1.5rem',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.25s ease',
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.1rem',
  },
};
