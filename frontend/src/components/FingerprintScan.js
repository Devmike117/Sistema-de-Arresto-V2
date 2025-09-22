import React from 'react';
import './FingerprintScan.css'; // Puedes crear este archivo para estilos personalizados

function FingerprintScan({ fingerprintFile, setFingerprintFile }) {
  return (
    <div className="fingerprint-scan-container">
      <h3 className="fs-title">Escaneo de Huellas</h3>
      <p className="fs-text">
        Coloca el dedo en el lector para iniciar el escaneo. (Funcionalidad pendiente)
      </p>

      {/* Vista previa si hay archivo */}
      {fingerprintFile ? (
        <div className="fs-preview">
          <img
            src={URL.createObjectURL(fingerprintFile)}
            alt="Huella escaneada"
            className="fs-image"
          />
          <button
            onClick={() => setFingerprintFile(null)}
            className="fc-btn fc-btn-warning"
          >
            Retomar huella
          </button>
        </div>
      ) : (
        <button
          onClick={() => alert('Escaneo de huellas aún no implementado')}
          className="fc-btn fc-btn-primary"
        >
          Escanear Huella
        </button>
      )}
    </div>
  );
}

export default FingerprintScan;
