import React from 'react';

function FacialCapture() {
  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-6 transition hover:shadow-xl">
      {/* Encabezado con ícono */}
      <div className="flex items-center justify-center mb-4">
        <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      </div>

      {/* Título y descripción */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">Captura Facial</h3>
      <p className="text-gray-600 text-sm mb-4">
        Esta sección permitirá capturar y analizar imágenes faciales para identificación biométrica. La funcionalidad está en desarrollo.
      </p>

      {/* Botón de acción */}
      <button
        disabled
        className="w-full py-2 px-4 bg-indigo-500 text-white font-medium rounded-lg shadow hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Activar cámara (próximamente)
      </button>
    </div>
  );
}

export default FacialCapture;
