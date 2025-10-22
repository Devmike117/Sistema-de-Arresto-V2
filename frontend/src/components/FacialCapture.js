import React, { useState, useRef, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function FacialCapture({ photoFile, setPhotoFile, onMessage }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [countdown, setCountdown] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        onMessage?.({ text: 'No se pudo acceder a la cámara', type: 'error' });
      }
    }

    if (!captured) startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [captured]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isCapturing) {
      executeCapture();
    }
  }, [countdown, isCapturing]);

  const capturePhoto = async () => {
    setIsCapturing(true);
    setCountdown(3);
  };

  const executeCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const zoom = zoomLevel;
    const cropWidth = canvas.width / zoom;
    const cropHeight = canvas.height / zoom;
    const cropX = (canvas.width - cropWidth) / 2;
    const cropY = (canvas.height - cropHeight) / 2;

    context.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
    context.scale(-1, 1);
    context.drawImage(canvas, -canvas.width, 0);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], `photo_${Date.now()}.png`, { type: 'image/png' });

      try {
        const formData = new FormData();
        formData.append('file', file);

        // Construir la URL del servicio de Python usando la misma IP base pero con el puerto 8001
        const pythonServiceUrl = API_BASE_URL.replace(':5000', ':8001');
        const response = await fetch(`${pythonServiceUrl}/generate_embedding/`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          onMessage?.({ text: 'No se reconoció una cara', type: 'error' });
          setIsCapturing(false);
          return;
        }

        setPhotoFile(file);
        setCaptured(true);
        setIsCapturing(false);
        onMessage?.({ text: 'Foto capturada correctamente', type: 'success' });

      } catch (err) {
        console.error('Error al enviar la imagen al backend:', err);
        onMessage?.({ text: 'Ocurrió un error al procesar la imagen', type: 'error' });
        setIsCapturing(false);
      }
    }, 'image/png');
  };

  const retakePhoto = () => {
    setPhotoFile(null);
    setCaptured(false);
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCamOn(false);
    } else {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(mediaStream => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
            setCamOn(true);
          }
        })
        .catch(err => {
          console.error('Error al acceder a la cámara:', err);
          onMessage?.({ text: 'No se pudo acceder a la cámara', type: 'error' });
        });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <span className="material-symbols-outlined" style={{ color: '#fff' }}>camera</span>
        </div>
        <div>
          <h3 style={styles.title}>Captura Facial</h3>
          <p style={styles.subtitle}>Captura una foto frontal clara de la persona</p>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={styles.captureArea}>
        {!captured ? (
          <>
            <div style={styles.videoContainer}>
              <video 
                ref={videoRef} 
                autoPlay 
                style={{
                  ...styles.video,
                  transform: `scaleX(-1) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease-in-out'
                }}
              />
              <div style={styles.videoOverlay}>
                <div style={styles.faceOutline}></div>
              </div>
              {countdown > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.3)',
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    fontSize: '4rem',
                    fontWeight: '800',
                    color: '#fff',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                  }}>
                    {countdown}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ color: '#fff' }}>Zoom:</label>
              <input 
                type="range" 
                min="1" 
                max="2" 
                step="0.1" 
                value={zoomLevel} 
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))} 
                style={{ width: '100%' }}
              />
            </div>

            <div style={styles.buttonGroup}>
              <button 
                onClick={capturePhoto}
                disabled={isCapturing}
                style={{
                  ...styles.captureButton,
                  opacity: isCapturing ? 0.6 : 1,
                  cursor: isCapturing ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !isCapturing && (e.target.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => !isCapturing && (e.target.style.transform = 'scale(1)')}
              >
                <span className='material-symbols-outlined'>camera_alt</span>
                {isCapturing ? `Tomando foto en ${countdown}...` : 'Tomar Foto'}
              </button>

              <button 
                onClick={toggleCamera}
                disabled={isCapturing}
                style={{
                  ...styles.toggleButton,
                  opacity: isCapturing ? 0.6 : 1,
                  cursor: isCapturing ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !isCapturing && (e.target.style.background = 'rgba(255, 255, 255, 0.25)')}
                onMouseLeave={(e) => !isCapturing && (e.target.style.background = 'rgba(255, 255, 255, 0.15)')}
              >
                <span className="material-symbols-outlined">{camOn ? 'no_photography' : 'photo_camera'}</span>
                {camOn ? 'Apagar Cámara' : 'Encender Cámara'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.photoContainer}>
              <img
                src={URL.createObjectURL(photoFile)}
                alt="Foto capturada"
                style={styles.photo}
              />
              <div style={styles.photoOverlay}>
                <span style={styles.checkmark}>
                  <span className="material-symbols-outlined">check</span>
                </span>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button 
                onClick={retakePhoto} 
                style={styles.retakeButton}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <span style={styles.buttonIcon}>
                  <span className="material-symbols-outlined">refresh</span>
                </span>
                Retomar Foto
              </button>
            </div>
          </>
        )}
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },

  icon: {
    fontSize: '2rem'
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
 captureArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    width: '100%' 
  },

  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '400px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '3px solid rgba(102, 126, 234, 0.5)'
  },

  video: {
    width: '100%',
    height: '100%',        
    display: 'block',
    transform: 'scaleX(-1)',
    objectFit: 'cover'
  },

  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  },

  faceOutline: {
    width: '60%',
    height: '75%',
    border: '3px dashed rgba(255, 255, 255, 0.5)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite'
  },

  photoContainer: {
    position: 'relative',
    width: '100%',
    height: '400px',       
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '3px solid rgba(79, 212, 102, 0.5)'
  },

  photo: {
    width: '100%',
    height: '100%',        
    display: 'block',
    objectFit: 'cover'     
  },
  photoOverlay: {
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

  captureButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '1rem',
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

  toggleButton: {
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    outline: 'none'
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
  }
};