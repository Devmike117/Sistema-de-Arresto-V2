import React, { useEffect, useState } from "react";
import "./Loader.css";

export default function Loader({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(textInterval);
          clearInterval(progressInterval);
          setFadeOut(true); // activa la animación de desvanecimiento
          setTimeout(() => {
            if (onFinish) onFinish(); // desmonta después de la transición
          }, 800); // coincide con la duración en CSS
          return 100;
        }
        return prev + 1.5;
      });
    }, 100);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [onFinish]);

  return (
    <div id="loader" className={fadeOut ? "fade-out" : ""}>
      <div className="loader"></div>
      <p className="loading-text">Cargando{dots}</p>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
