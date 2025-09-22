import React, { useState } from "react";
import FacialCapture from "./FacialCapture";

export default function FacialSearch({ onMessage }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    if (!photoFile) {
      onMessage({ type: "error", text: "Primero captura la foto." });
      return;
    }

    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      const res = await fetch("http://localhost:5000/api/search_face", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        onMessage({ type: "success", text: "Búsqueda completada" });
      } else {
        onMessage({ type: "error", text: data.error || "No se encontró coincidencia." });
      }
    } catch (err) {
      console.error(err);
      onMessage({ type: "error", text: "Error en la búsqueda. Revisa la consola." });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <FacialCapture photoFile={photoFile} setPhotoFile={setPhotoFile} />
      <button
        onClick={handleSearch}
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#4caf50",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Buscar Persona
      </button>
      {result && (
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <h3>Resultado:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
