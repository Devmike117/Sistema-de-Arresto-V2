import React, { useState } from "react";


const faltasAdministrativas = [
  "Alteración al orden público",
  "Realizar necesidades fisiológicas en vía pública",
  "Realizar en cruceros actividades que pongan en riesgo la integridad física",
  "Ingerir bebidas embriagantes en vía pública",
  "Inhalar sustancias tóxicas en vía pública",
  "Pega de propaganda",
  "Faltas a la moral",
  "Arrojar en lugares no autorizados animales muertos, escombros y desperdicios",
  "Daños a los bienes del municipio",
  "Dañar, podar o talar árboles",
  "Trepar bardas o cualquier inmueble ajeno sin autorización",
  "Pasar la señal roja del semáforo",
  "Obstruir rampa para discapacitados",
  "Vender animales o mascotas en vía pública",
  "Otro"
];

const comunidadesArresto = [
  "Atotonilco",
  "Barrio De Trojes",
  "Colonia Cuauhtémoc",
  "Colonia Francisco I Madero",
  "Colonia Luis Donaldo Colosio",
  "Dolores Enyege",
  "Ejido 20 De Noviembre",
  "El Rincón De Los Perales",
  "El Tecomate",
  "Emiliano Zapata",
  "Guadalupe Cachi",
  "Guadalupe Del Río",
  "Huereje",
  "Ixtlahuaca De Rayón",
  "Jalpa De Dolores",
  "Jalpa De Los Baños",
  "La Bandera",
  "La Concepción De Los Baños",
  "La Concepción Enyege",
  "La Estación Del Ferrocarril",
  "La Guadalupana",
  "La Purisima",
  "San Andrés Del Pedregal",
  "San Antonio Bonixi",
  "San Antonio De Los Remedios",
  "San Bartolo Del Llano",
  "San Cristóbal De Los Baños",
  "San Francisco De Asís",
  "San Francisco De Guzmán",
  "San Francisco Del Río",
  "San Francisco Ixtlahuaca",
  "San Ignacio Del Pedregal",
  "San Ildefonso",
  "San Isidro Boxipe",
  "San Jerónimo Ixtapantongo",
  "San Jerónimo La Cañada",
  "San Joaquín El Junco",
  "San Joaquín La Cabecera",
  "San José Del Río",
  "San Juan De Las Manzanas",
  "San Lorenzo Toxico",
  "San Mateo Ixtlahuaca",
  "San Miguel El Alto",
  "San Miguel Enyege",
  "San Pablo De Los Remedios",
  "San Pedro De Los Baños",
  "San Pedro La Cabecera",
  "Santa Ana Ixtlahuaca",
  "Santa Ana La Ladera",
  "Santa María De Guadalupe",
  "Santa María Del Llano",
  "Santo Domingo De Guzmán",
  "Santo Domingo Huereje",
  "Shira"
];

const oficialesList = [
  { id: 1, name: "Oficial 1", turno: "Primer Turno" },
  { id: 2, name: "Oficial 2", turno: "Primer Turno" },
  { id: 3, name: "Oficial 3", turno: "Segundo Turno" },
  { id: 4, name: "Oficial 4", turno: "Segundo Turno" },
];

export default function ArrestModal({ person, onClose, onSave }) {
  const [formData, setFormData] = useState({
    falta_administrativa: "",
    comunidad: "",
    turno: "",
    arresting_officer: "",
    folio: "",
    rnd: "",
    sentencia: "",
    otra_falta: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "turno" ? { arresting_officer: "" } : {}), // reset oficial si cambia turno
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.falta_administrativa.trim() ||
      !formData.comunidad.trim() ||
      (formData.falta_administrativa === "Otro" && !formData.otra_falta.trim())
    ) {
      alert("Debes llenar Falta administrativa y Comunidad");
      return;
    }

    const dataToSend = {
      person_id: person.id,
      falta_administrativa:
        formData.falta_administrativa === "Otro"
          ? formData.otra_falta.trim()
          : formData.falta_administrativa.trim(),
      comunidad: formData.comunidad.trim(),
      arresting_officer: formData.arresting_officer.trim() || null,
      folio: formData.folio.trim() || null,
      rnd: formData.rnd.trim() || null,
      sentencia: formData.sentencia.trim() || null,
    };

    onSave(dataToSend);
  };

  // Turnos únicos
  const turnos = [...new Set(oficialesList.map((o) => o.turno))];

  // Oficiales filtrados según el turno seleccionado
  const oficialesFiltrados = oficialesList.filter(
    (o) => o.turno === formData.turno
  );

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle}>✖</button>
        <h2 style={titleStyle}>Nuevo Arresto</h2>
        <p style={subtitleStyle}>
          Persona: <strong>{person.first_name} {person.last_name}</strong>
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <select
            name="falta_administrativa"
            value={formData.falta_administrativa}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Selecciona falta administrativa</option>
            {faltasAdministrativas.map((falta) => (
              <option key={falta} value={falta}>{falta}</option>
            ))}
          </select>

          {formData.falta_administrativa === "Otro" && (
            <input
              name="otra_falta"
              placeholder="Especifica la falta"
              value={formData.otra_falta}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          )}

          <select
            name="comunidad"
            value={formData.comunidad}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Selecciona una comunidad</option>
            {comunidadesArresto.map((comunidad) => (
              <option key={comunidad} value={comunidad}>
                {comunidad}
              </option>
            ))}
          </select>

          {/* Select Turno */}
          <select
            name="turno"
            value={formData.turno}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Seleccione un Turno</option>
            {turnos.map((t, index) => (
              <option key={index} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Select Oficial filtrado por turno */}
          <select
            name="arresting_officer"
            value={formData.arresting_officer}
            onChange={handleChange}
            style={inputStyle}
            required
            disabled={!formData.turno}
          >
            <option value="">Seleccione un Oficial</option>
            {oficialesFiltrados.map((o) => (
              <option key={o.id} value={o.name}>
                {o.name} - {o.turno}
              </option>
            ))}
          </select>

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
