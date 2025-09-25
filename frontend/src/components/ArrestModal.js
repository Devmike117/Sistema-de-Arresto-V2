import React, { useState } from "react";

export default function ArrestModal({ person, onClose, onSave }) {
  const [formData, setFormData] = useState({
    falta_administrativa: "",
    comunidad: "",
    arresting_officer: "",
    folio: "",
    rnd: "",
    sentencia: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!formData.falta_administrativa.trim() || !formData.comunidad.trim()) {
      alert("Debes llenar Falta administrativa y Comunidad");
      return;
    }

    const dataToSend = {
      person_id: person.id,
      falta_administrativa: formData.falta_administrativa.trim(),
      comunidad: formData.comunidad.trim(),
      arresting_officer: formData.arresting_officer.trim() || null,
      folio: formData.folio.trim() || null,
      rnd: formData.rnd.trim() || null,
      sentencia: formData.sentencia.trim() || null,
    };

    // Enviar datos al backend
    onSave(dataToSend);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle}>✖</button>
        <h2 style={titleStyle}>Nuevo Arresto</h2>
        <p style={subtitleStyle}>
          Persona: <strong>{person.first_name} {person.last_name}</strong>
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            name="falta_administrativa"
            placeholder="Falta administrativa"
            value={formData.falta_administrativa}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            name="comunidad"
            placeholder="Comunidad"
            value={formData.comunidad}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            name="arresting_officer"
            placeholder="Oficial a cargo"
            value={formData.arresting_officer}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="folio"
            placeholder="Folio"
            value={formData.folio}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="rnd"
            placeholder="RND"
            value={formData.rnd}
            onChange={handleChange}
            style={inputStyle}
          />
          <textarea
            name="sentencia"
            placeholder="Sentencia"
            value={formData.sentencia}
            onChange={handleChange}
            rows="3"
            style={textareaStyle}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancelar</button>
            <button type="submit" style={saveBtnStyle}>Guardar Arresto</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Estilos ---
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
