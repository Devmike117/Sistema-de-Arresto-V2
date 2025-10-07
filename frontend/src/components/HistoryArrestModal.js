import React from "react";

export default function HistoryArrestModal({ open, onClose, arrests = [], person }) {
  if (!open) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#1e1e2f",
        color: "#fff",
        borderRadius: "12px",
        padding: "2rem",
        minWidth: "350px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0px 4px 15px rgba(0,0,0,0.5)"
      }}>
        <h2 style={{ marginBottom: "1rem" }}>
          Historial de Arrestos {person && `- ${person.first_name} ${person.last_name}`}
        </h2>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 30,
            background: "transparent",
            color: "#fff",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer"
          }}
          aria-label="Cerrar"
        >
          ×
        </button>
        {arrests.length === 0 ? (
          <p>No hay arrestos registrados.</p>
        ) : (
          arrests.map((a, idx) => (
            <div key={idx} style={{
              background: "#2a2a3d",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem"
            }}>
              <div><strong>Fecha:</strong> {formatDate(a.arrest_date)}</div>
              <div><strong>Falta:</strong> {a.falta_administrativa || "N/A"}</div>
              <div><strong>Comunidad:</strong> {a.comunidad || "N/A"}</div>
              <div><strong>Oficial:</strong> {a.arresting_officer || "N/A"}</div>
              <div><strong>Folio:</strong> {a.folio || "N/A"}</div>
              <div><strong>RND:</strong> {a.rnd || "N/A"}</div>
              <div><strong>Sentencia:</strong> {a.sentencia || "N/A"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}