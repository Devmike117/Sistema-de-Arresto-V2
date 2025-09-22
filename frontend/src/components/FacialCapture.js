import React, { useState, useRef, useEffect } from 'react';
import './FacialCapture.css';

export default function FacialCapture({ photoFile, setPhotoFile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [camOn, setCamOn] = useState(true); //  Estado para el botón

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
      }
    }

    if (!captured) startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [captured]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);


    canvas.toBlob(blob => {
      const file = new File([blob], `photo_${Date.now()}.png`, { type: 'image/png' });
      setPhotoFile(file);
      setCaptured(true);
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
        .catch(err => console.error('Error al acceder a la cámara:', err));
    }
  };

  return (
    <div className="facial-capture-container">
      <h3 className="fc-title">Captura Facial</h3>
      <p className="fc-text">
        Usa la cámara para capturar la foto frontal de la persona. Puedes retomar si no queda bien.
      </p>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!captured ? (
        <>
          <video ref={videoRef} autoPlay className="fc-video" />
          <button onClick={capturePhoto} className="fc-btn fc-btn-primary">
            Tomar foto
          </button>
          <button onClick={toggleCamera} className="fc-btn fc-btn-primary">
            {camOn ? 'Apagar cámara' : 'Prender cámara'}
          </button>
        </>
      ) : (
        <>
          <img
            src={URL.createObjectURL(photoFile)}
            alt="captured"
            className="fc-photo"
          />
          <button onClick={retakePhoto} className="fc-btn fc-btn-warning">
            Retomar foto
          </button>
        </>
      )}
    </div>
  );
}
