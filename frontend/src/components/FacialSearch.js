import React, { useState } from "react";
import FacialCapture from "./FacialCapture";
import ArrestModal from "./ArrestModal";

export default function FacialSearch({ onMessage }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async () => {
    if (!photoFile) {
      onMessage({ type: "error", text: "Primero captura la foto." });
      return;
    }

    setLoading(true);
    setResult(null);

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
        onMessage({ type: "success", text: "Búsqueda completada" });
      }
    } catch (err) {
      console.error(err);
      onMessage({ type: "error", text: "Error en la búsqueda. Revisa la consola." });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSaveArrest = async (arrestData) => {
    if (!result || !result.person) return;

    try {
      const res = await fetch("http://localhost:5000/api/arrests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person_id: result.person.id, ...arrestData }),
      });

      const data = await res.json();
      if (res.ok) {
        onMessage({ type: "success", text: "Arresto registrado correctamente" });
        setShowModal(false);
        handleSearch(); // recarga la persona con arrestos actualizados
      } else {
        onMessage({ type: "error", text: data.error || "Error al registrar arresto" });
      }
    } catch (err) {
      console.error(err);
      onMessage({ type: "error", text: "Error al registrar arresto" });
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
          {/* Mostrar la informacion de resultados en otra seccion horizontal  */}
          
      {result && (
        <div
          style={{
            marginTop: "1.5rem",
            width: "100%",
            maxWidth: "650px",
            background: "#1e1e2f",
            color: "#fff",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0px 4px 15px rgba(0,0,0,0.5)",
          }}
        >

          

          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Resultado</h2>
          {result.found ? (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <img
                src={`http://localhost:5000/uploads/photos/${result.person.photo_path.split("\\").pop()}`}
                alt="Foto de la persona"
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "2px solid #4caf50",
                }}
              />
              <div style={{ flex: "1 1 400px" }}>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
                  {result.person.first_name} {result.person.last_name}{" "}
                  {result.person.alias && `(${result.person.alias})`}
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                  <div><strong>Fecha de Nac.:</strong> {formatDate(result.person.dob)}</div>
                  <div><strong>Género:</strong> {result.person.gender || "N/A"}</div>
                  <div><strong>Nacionalidad:</strong> {result.person.nationality || "N/A"}</div>
                  <div><strong>Estado:</strong> {result.person.state || "N/A"}</div>
                  <div><strong>Municipio:</strong> {result.person.municipality || "N/A"}</div>
                  <div><strong>Comunidad:</strong> {result.person.community || "N/A"}</div>
                </div>
              </div>
            </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4>Información Personal</h4>
                <p><strong>ID:</strong> {result.person.id_number || "N/A"}</p>
                <p><strong>Notas:</strong> {result.person.observaciones || "Sin notas"}</p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4>Historial de Arrestos</h4>
                {result.person.arrests && result.person.arrests.length > 0 ? result.person.arrests.map((a, index) => (
                <div key={index} style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  backgroundColor: "#2a2a3d",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <p><strong>Fecha:</strong> {formatDate(a.arrest_date)}</p>
                    <p><strong>Falta:</strong> {a.falta_administrativa || "N/A"}</p>
                    <p><strong>Comunidad:</strong> {a.comunidad || "N/A"}</p>
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <p><strong>Oficial:</strong> {a.arresting_officer || "N/A"}</p>
                    <p><strong>Folio:</strong> {a.folio || "N/A"}</p>
                    <p><strong>RND:</strong> {a.rnd || "N/A"}</p>
                    <p><strong>Sentencia:</strong> {a.sentencia || "N/A"}</p>
                  </div>
                </div>
              )) : (
                <p>No hay arrestos registrados.</p>
              )}
              </div>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#2196f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Registrar Arresto
                </button>
              </div>
            </>
          ) : (
            <p style={{ textAlign: "center" }}>No se encontró ninguna coincidencia.</p>
          )}
        </div>
      )}

      {showModal && result?.person && (
        <ArrestModal
          person={result.person}
          onClose={() => setShowModal(false)}
          onSave={handleSaveArrest}
        />
      )}
    </div>
  );
}
