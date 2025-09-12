import React, { useEffect } from "react";
import "./notification.css"; // Aquí van los estilos

export default function Notification({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500); // desaparece a los 3.5s
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`notification ${message.type}`}>
      {message.text}
    </div>
  );
}
