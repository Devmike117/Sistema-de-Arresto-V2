import React, { useState } from 'react';

function FingerprintScan({ fingerprintFile, setFingerprintFile }) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simular escaneo
    setTimeout(() => {
      setIsScanning(false);
      alert('Escaneo de huellas aún no implementado');
    }, 1500);
  };

  const handleRetake = () => {
    setFingerprintFile(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <span className="material-symbols-outlined" style={{ color: '#fff' }}>fingerprint</span>
        </div>
        <div>
          <h3 style={styles.title}>Escaneo de Huellas</h3>
          <p style={styles.subtitle}>
            Captura la huella dactilar para identificación biométrica
          </p>
        </div>
      </div>

      <div style={styles.scanArea}>
        {!fingerprintFile ? (
          <>
            {/* Simulación de scanner */}
            <div style={styles.scannerContainer}>
              <div style={{
                ...styles.scanner,
                ...(isScanning ? styles.scannerActive : {})
              }}>
                <div style={styles.scannerOverlay}>
                  <span style={styles.fingerprintIcon}>
                    {isScanning ? (
                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '60px' }}>autorenew</span>
                  ) : (
                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '60px' }}>fingerprint</span>
                  )}

                  </span>
                  {isScanning && (
                    <div style={styles.scanLine}></div>
                  )}
                </div>
                <div style={styles.gridPattern}>
                  {[...Array(5)].map((_, row) => (
                    <div key={row} style={styles.gridRow}>
                      {[...Array(5)].map((_, col) => (
                        <div key={col} style={styles.gridCell}></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <p style={styles.instruction}>
                {isScanning ? 'Escaneando...' : 'Coloca tu dedo en el área de escaneo'}
              </p>
            </div>

            <button 
              onClick={handleScan}
              disabled={isScanning}
              style={{
                ...styles.scanButton,
                ...(isScanning ? styles.scanButtonDisabled : {})
              }}
              onMouseEnter={(e) => !isScanning && (e.target.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => !isScanning && (e.target.style.transform = 'scale(1)')}
            >
              <span style={styles.buttonIcon}>
                {isScanning ? (
                  <span className="material-symbols-outlined" style={{ color: '#fff' }}>hourglass_empty</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ color: '#fff' }}>fingerprint</span>
                )}
              </span>
              {isScanning ? 'Escaneando...' : 'Iniciar Escaneo'}
            </button>
          </>
        ) : (
          <>
            {/* Vista previa de huella */}
            <div style={styles.previewContainer}>
              <img
                src={URL.createObjectURL(fingerprintFile)}
                alt="Huella escaneada"
                style={styles.previewImage}
              />
              <div style={styles.previewOverlay}>
                <span style={styles.checkmark}>✓</span>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button 
                onClick={handleRetake}
                style={styles.retakeButton}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <span style={styles.buttonIcon}>↻</span>
                Reescanear Huella
              </button>
            </div>

            <div style={styles.successMessage}>
              <span style={styles.successIcon}>✓</span>
              Huella capturada correctamente
            </div>
          </>
        )}
      </div>

      {/* Información adicional */}
      <div style={styles.infoBox}>
        <span className="material-symbols-outlined" style={styles.infoIcon}>info</span>
        <p style={styles.infoText}>
          Asegúrate de que el dedo esté limpio y seco para obtener un mejor escaneo
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 48%',   // ocupa aprox. la mitad del ancho
    minWidth: '300px',  // evita que sea demasiado pequeño
    boxSizing: 'border-box',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem'
  },

  iconContainer: {
    background: 'linear-gradient(135deg, #871195ff 0%, #f5576c 100%)',
    padding: '1rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
  },

  icon: {
    fontSize: '2rem'
  },

  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },

  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: '0.25rem 0 0 0'
  },

  scanArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '1rem',
    width: '100%' // ocupa todo el ancho del contenedor
  },

  scannerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '100%'
  },

  scanner: {
    position: 'relative',
    width: '100%',        // ocupa todo el ancho de la columna
    maxWidth: '335px',    // ancho máximo
    aspectRatio: '1 / 1', // mantiene forma cuadrada
    background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.3) 0%, rgba(102, 126, 234, 0.3) 100%)',
    borderRadius: '16px',
    border: '3px solid rgba(245, 87, 108, 0.5)',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease'
  },

  scannerActive: {
    boxShadow: '0 8px 32px rgba(245, 87, 108, 0.5)',
    border: '3px solid rgba(245, 87, 108, 0.8)'
  },

  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2

  },

  fingerprintIcon: {
    fontSize: '4rem',
    opacity: 0.3,
    color: '#fff'
  },

  scanLine: {
    position: 'absolute',
    width: '100%',
    height: '3px',
    background: 'linear-gradient(90deg, transparent, rgba(245, 87, 108, 0.8), transparent)',
    animation: 'scan 2s linear infinite',
    boxShadow: '0 0 10px rgba(245, 87, 108, 0.8)'
  },

  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  gridRow: {
    display: 'flex',
    gap: '0.5rem',
    flex: 1
  },

  gridCell: {
    flex: 1,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px'
  },

  instruction: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center'
  },

  scanButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    outline: 'none'
  },

  scanButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },

  previewContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '250px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '3px solid rgba(79, 212, 102, 0.5)'
  },

  previewImage: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },

  previewOverlay: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(79, 172, 254, 0.5)'
  },

  checkmark: {
    fontSize: '1.5rem',
    color: '#fff',
    fontWeight: 'bold'
  },

  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%'
  },

  retakeButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 8px 20px rgba(245, 87, 108, 0.4)',
    transition: 'all 0.3s ease',
    outline: 'none'
  },

  buttonIcon: {
    fontSize: '1.2rem'
  },

  successMessage: {
    background: 'rgba(79, 212, 102, 0.2)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    border: '1px solid rgba(79, 212, 102, 0.3)'
  },

  successIcon: {
    fontSize: '1.2rem',
    color: '#4fd466'
  },

  infoBox: {
    background: 'rgba(79, 172, 254, 0.1)',
    border: '1px solid rgba(79, 172, 254, 0.3)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '1rem'
  },

  infoIcon: {
    fontSize: '1.5rem',
    flexShrink: 0
  },

  infoText: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    lineHeight: '1.4'
  }
};

// keyframes para la animación de escaneo
const styleSheet = document.styleSheets[0];
const keyframes = `
  @keyframes scan {
    0% { top: 0; }
    50% { top: calc(100% - 3px); }
    100% { top: 0; }
  }
`;
try {
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
} catch (e) {}
export default FingerprintScan;
