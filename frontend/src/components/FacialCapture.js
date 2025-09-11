import React, { useState, useRef, useEffect } from 'react';

export default function FacialCapture({ photoFile, setPhotoFile }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(false);

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

    startCamera();

    return () => {
      // Detener la cámara al desmontar
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // ✅ Dependencias vacías, solo se ejecuta al montar

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

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

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Captura Facial</h3>
      <p className="text-gray-600 text-sm mb-4">
        Usa la cámara para capturar la foto frontal de la persona. Puedes retomar si no queda bien.
      </p>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!captured ? (
        <>
          <video ref={videoRef} autoPlay className="w-full rounded-lg shadow" />
          <button
            onClick={capturePhoto}
            className="w-full py-2 mt-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Tomar foto
          </button>
        </>
      ) : (
        <>
          <img
            src={URL.createObjectURL(photoFile)}
            alt="captured"
            className="w-full h-60 object-cover rounded-lg shadow"
          />
          <button
            onClick={retakePhoto}
            className="w-full py-2 mt-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Retomar foto
          </button>
        </>
      )}
    </div>
  );
}
