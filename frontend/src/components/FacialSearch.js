import React, { useState } from "react";
import FacialCapture from "./FacialCapture";
import ArrestModal from "./ArrestModal";

export default function FacialSearch({ onMessage }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Buscar persona
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

  // Guardar arresto
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
        // Actualizar historial de arrestos en la UI
        setResult((prev) => ({
          ...prev,
          person: {
            ...prev.person,
            arrests: [...(prev.person.arrests || []), data],
          },
        }));
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
              <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                <img
                  src={`http://localhost:5000/uploads/photos/${result.person.photo_path.split("\\").pop()}`}
                  alt="Foto de la persona"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    marginRight: "1rem",
                    border: "2px solid #4caf50",
                  }}
                />
                <div>
                  <h3 style={{ fontSize: "1.4rem" }}>
                    {result.person.first_name} {result.person.middle_name} {result.person.last_name}
                  </h3>
                  <p><strong>Fecha de Nac.:</strong> {result.person.dob || "N/A"}</p>
                  <p><strong>Género:</strong> {result.person.gender || "N/A"}</p>
                  <p><strong>Nacionalidad:</strong> {result.person.nationality || "N/A"}</p>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4>Información Personal</h4>
                <p><strong>Dirección:</strong> {result.person.address || "N/A"}</p>
                <p><strong>Teléfono:</strong> {result.person.phone_number || "N/A"}</p>
                <p><strong>ID:</strong> {result.person.id_number || "N/A"}</p>
                <p><strong>Notas:</strong> {result.person.notes || "Sin notas"}</p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4>Historial de Arrestos</h4>
                {result.person.arrests && result.person.arrests.length > 0 ? (
                  <ul style={{ paddingLeft: "1.2rem" }}>
                    {result.person.arrests.map((a, index) => (
                      <li key={index} style={{ marginBottom: "0.5rem" }}>
                        <p><strong>Fecha:</strong> {new Date(a.arrest_date).toLocaleDateString()}</p>
                        <p><strong>Delito:</strong> {a.offense}</p>
                        <p><strong>Lugar:</strong> {a.location}</p>
                        <p><strong>Oficial:</strong> {a.arresting_officer}</p>
                        <p><strong>Expediente:</strong> {a.case_number}</p>
                        <p><strong>Fianza:</strong> {a.bail_status ? "Permitida" : "Denegada"}</p>
                        <p><strong>Notas:</strong> {a.notes || "N/A"}</p>
                        <hr style={{ border: "0.5px solid #444" }} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay arrestos registrados.</p>
                )}
              </div>

              {/* Botón para abrir modal */}
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

      {/* Modal */}
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
