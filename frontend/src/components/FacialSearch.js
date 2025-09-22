import React, { useState } from "react";
import FacialCapture from "./FacialCapture";

export default function FacialSearch({ onMessage }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!photoFile) {
      onMessage({ type: "error", text: "Primero captura la foto." });
      return;
    }

    setLoading(true);
    setResult(null);
    setDistance(null);

    try {
      const formData = new FormData();
      formData.append("file", photoFile);

      const res = await fetch("http://localhost:5000/api/search_face", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        onMessage({ type: "error", text: data.error || "Error en la búsqueda" });
      } else {
        setResult(data);

        // Si el backend envía la distancia, la mostramos
        if (data.distance !== undefined) {
          setDistance(data.distance.toFixed(3));
        }

        onMessage({ type: "success", text: "Búsqueda completada" });
      }
    } catch (err) {
      console.error(err);
      onMessage({ type: "error", text: "Error en la búsqueda. Revisa la consola." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <FacialCapture photoFile={photoFile} setPhotoFile={setPhotoFile} />

      <button
        onClick={handleSearch}
        disabled={loading}
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: loading ? "#9e9e9e" : "#4caf50",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Buscando..." : "Buscar Persona"}
      </button>

      {result && (
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <h3>Resultado:</h3>
          {result.found ? (
            <>
              <pre>{JSON.stringify(result.person, null, 2)}</pre>
              {distance && <p>Distancia al embedding: {distance}</p>}
            </>
          ) : (
            <p>No se encontró ninguna coincidencia.</p>
          )}
        </div>
      )}
    </div>
  );
}
