import React, { useState } from "react";

export default function ArrestModal({ person, onClose, onSave }) {
  const [formData, setFormData] = useState({
    offense: "",
    location: "",
    arresting_officer: "",
    case_number: "",
    bail_status: false,
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Crear objeto completo con valores por defecto si faltan
    const dataToSend = {
      person_id: person.id,
      offense: formData.offense.trim() || "N/A",
      location: formData.location.trim() || "N/A",
      arresting_officer: formData.arresting_officer.trim() || "N/A",
      case_number: formData.case_number.trim() || "N/A",
      bail_status: formData.bail_status,
      notes: formData.notes.trim() || "",
    };

    // Llamar a la función onSave pasada desde el padre
    onSave(dataToSend);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Cerrar */}
        <button onClick={onClose} style={closeBtnStyle}>✖</button>

        <h2 style={titleStyle}>Nuevo Arresto</h2>
        <p style={subtitleStyle}>
          Persona: <strong>{person.first_name} {person.last_name}</strong>
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <input name="offense" placeholder="Delito" value={formData.offense} onChange={handleChange} style={inputStyle} required />
          <input name="location" placeholder="Lugar" value={formData.location} onChange={handleChange} style={inputStyle} required />
          <input name="arresting_officer" placeholder="Oficial a cargo" value={formData.arresting_officer} onChange={handleChange} style={inputStyle} />
          <input name="case_number" placeholder="Número de caso" value={formData.case_number} onChange={handleChange} style={inputStyle} />
          
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" name="bail_status" checked={formData.bail_status} onChange={handleChange} />
            Tiene fianza
          </label>

          <textarea name="notes" placeholder="Notas" value={formData.notes} onChange={handleChange} rows="3" style={textareaStyle}></textarea>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancelar</button>
            <button type="submit" style={saveBtnStyle}>Guardar Arresto</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Estilos
const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalStyle = {
  backgroundColor: "#1f1f2e",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "500px",
  padding: "2rem",
  position: "relative",
  boxShadow: "0px 5px 15px rgba(0,0,0,0.5)",
  color: "#fff",
};

const closeBtnStyle = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  background: "none",
  border: "none",
  fontSize: "1.2rem",
  cursor: "pointer",
  color: "#fff",
};

const titleStyle = {
  marginBottom: "0.5rem",
  fontSize: "1.5rem",
  fontWeight: "bold",
};

const subtitleStyle = {
  marginBottom: "1rem",
  color: "#ccc",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const inputStyle = {
  padding: "0.5rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid #555",
  outline: "none",
  backgroundColor: "#2a2a3f",
  color: "#fff",
};

const textareaStyle = { ...inputStyle, resize: "none" };

const cancelBtnStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "1px solid #555",
  backgroundColor: "#2a2a3f",
  color: "#fff",
  cursor: "pointer",
};

const saveBtnStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#4caf50",
  color: "#fff",
  cursor: "pointer",
};
