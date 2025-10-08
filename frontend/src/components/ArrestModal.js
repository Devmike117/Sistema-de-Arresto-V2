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
      ...(name === "turno" ? { arresting_officer: "" } : {}),
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

  const turnos = [...new Set(oficialesList.map((o) => o.turno))];
  const oficialesFiltrados = oficialesList.filter(
    (o) => o.turno === formData.turno
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header del Modal */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.iconContainer}>
              <span style={styles.icon}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>e911_emergency</span>
              </span>
            </div>
            <div>
              <h2 style={styles.title}>Nuevo Arresto</h2>
              <p style={styles.subtitle}>
                <span style={styles.personIcon}></span>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>person</span>
                
                {person.first_name} {person.last_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            ✖
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Falta administrativa */}
          <div style={styles.field}>
            <label style={styles.label}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>gavel</span>
              Falta Administrativa *</label>
            <select
              name="falta_administrativa"
              value={formData.falta_administrativa}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Selecciona una opción</option>
              {faltasAdministrativas.map((falta) => (
                <option key={falta} value={falta}>{falta}</option>
              ))}
            </select>
          </div>

          {formData.falta_administrativa === "Otro" && (
            <div style={styles.field}>
              <label style={styles.label}>Especificar Falta *</label>
              <input
                name="otra_falta"
                placeholder="Describe la falta administrativa"
                value={formData.otra_falta}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          )}

          {/* Comunidad */}
          <div style={styles.field}>
            <label style={styles.label}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>location_city</span>
              Comunidad del Arresto *</label>
            <select
              name="comunidad"
              value={formData.comunidad}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Selecciona una comunidad</option>
              {comunidadesArresto.map((comunidad) => (
                <option key={comunidad} value={comunidad}>
                  {comunidad}
                </option>
              ))}
            </select>
          </div>

          {/* Grid para Turno y Oficial */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>access_time</span>
                Turno *</label>
              <select
                name="turno"
                value={formData.turno}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Seleccione un turno</option>
                {turnos.map((t, index) => (
                  <option key={index} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>local_police</span>
                Oficial *</label>
              <select
                name="arresting_officer"
                value={formData.arresting_officer}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  ...((!formData.turno) ? styles.selectDisabled : {})
                }}
                required
                disabled={!formData.turno}
              >
                <option value="">Seleccione un oficial</option>
                {oficialesFiltrados.map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid para Folio y RND */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>description</span>
                Folio</label>
              <input
                name="folio"
                placeholder="Número de folio"
                value={formData.folio}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>description</span>
                RND</label>
              <input
                name="rnd"
                placeholder="Registro Nacional"
                value={formData.rnd}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Sentencia */}
          <div style={styles.field}>
            <label style={styles.label}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>gavel</span>
              Sentencia</label>
            <textarea
              name="sentencia"
              placeholder="Describe la sentencia aplicada..."
              value={formData.sentencia}
              onChange={handleChange}
              rows="3"
              style={styles.textarea}
            />
          </div>

          {/* Botones */}
          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={onClose} 
              style={styles.cancelButton}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>close</span>
              Cancelar
            </button>
            <button 
              type="submit" 
              style={styles.saveButton}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>save</span>
              Guardar Arresto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem"
  },

  modal: {
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "1.5rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
  },

  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  },

  iconContainer: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    padding: "0.75rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(245, 87, 108, 0.3)"
  },

  icon: {
    fontSize: "1.8rem"
  },

  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
  },

  subtitle: {
    fontSize: "0.95rem",
    color: "rgba(255, 255, 255, 0.8)",
    margin: "0.25rem 0 0 0",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },

  personIcon: {
    fontSize: "1.1rem"
  },

  closeButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#fff",
    transition: "all 0.2s ease",
    outline: "none"
  },

  form: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem"
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem"
  },

  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#fff",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)"
  },

  input: {
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#333",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit"
  },

  select: {
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#333",
    outline: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit"
  },

  selectDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },

  textarea: {
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#333",
    outline: "none",
    resize: "vertical",
    minHeight: "80px",
    transition: "all 0.2s ease",
    fontFamily: "inherit"
  },

  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "0.5rem",
    justifyContent: "flex-end"
  },

  cancelButton: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    padding: "0.75rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease",
    outline: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },

  saveButton: {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.75rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)",
    transition: "all 0.3s ease",
    outline: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  }
};