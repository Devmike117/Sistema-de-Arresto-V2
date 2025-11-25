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
  { id: 1, name: "AGUILAR REYES SANTIAGO", turno: "Primer Turno" },
  { id: 2, name: "AGUILAR MENDOZA LUCIO", turno: "Primer Turno" },
  { id: 3, name: "AGUSTÍN MEDINA WALDEMAR", turno: "Primer Turno" },
  { id: 4, name: "ALBA VALLEJO JOSÉ", turno: "Primer Turno" },
  { id: 5, name: "ALCÁNTARA MELCHOR ROLANDO", turno: "Primer Turno" },
  { id: 6, name: "ÁLVAREZ MARTÍNEZ JUAN", turno: "Primer Turno" },
  { id: 7, name: "ALEJO CORTEZ ISMAEL", turno: "Primer Turno" },
  { id: 8, name: "AMADO CAYETANO MARIO", turno: "Primer Turno" },
  { id: 9, name: "ANDRÉS ISIDRO EDUARDO", turno: "Primer Turno" },
  { id: 10, name: "ÁNGELES SANDOVAL ALEJANDRO", turno: "Primer Turno" },
  { id: 11, name: "ANTONIO MARCIAL JORGE LUIS", turno: "Primer Turno" },
  { id: 12, name: "BENAVIDES ENRÍQUEZ MARIO ALBERTO", turno: "Primer Turno" },
  { id: 13, name: "CANCÍN MATÍAS AUGUSTO CESAR", turno: "Primer Turno" },
  { id: 14, name: "CONTRERAS ÁNGELES ANTONIO", turno: "Primer Turno" },
  { id: 15, name: "DÁVALOS CRUZ JOSÉ HUMBERTO", turno: "Primer Turno" },
  { id: 16, name: "DÍAZ MATA EPIFANIO", turno: "Primer Turno" },
  { id: 17, name: "DÍAZ SANTIAGO ANDRÉS", turno: "Primer Turno" },
  { id: 18, name: "DURAN MIRELES DAVID", turno: "Primer Turno" },
  { id: 19, name: "GARCÍA CRUZ ROBERTO", turno: "Primer Turno" },
  { id: 20, name: "GÓMEZ HERNÁNDEZ EDUARDO", turno: "Primer Turno" },
  { id: 21, name: "GONZÁLEZ SÁNCHEZ ISIDRO", turno: "Primer Turno" },
  { id: 22, name: "GUZMÁN JULIÁN JUAN", turno: "Primer Turno" },
  { id: 23, name: "JIMÉNEZ PEDRAZA JUAN", turno: "Primer Turno" },
  { id: 24, name: "LÓPEZ JIMÉNEZ DAVID", turno: "Primer Turno" },
  { id: 25, name: "LÓPEZ MENDOZA ABDIEL", turno: "Primer Turno" },
  { id: 26, name: "LUCIO GARCÍA CESAR", turno: "Primer Turno" },
  { id: 27, name: "LUIS AMADO LÁZARO", turno: "Primer Turno" },
  { id: 28, name: "MATEO CARMONA HUGO", turno: "Primer Turno" },
  { id: 29, name: "MONROY CORTEZ KEVIN URIEL", turno: "Primer Turno" },
  { id: 30, name: "NAVA BALLINA WILFRIDO", turno: "Primer Turno" },
  { id: 31, name: "NICOLÁS JIMÉNEZ EFRÉN", turno: "Primer Turno" },
  { id: 32, name: "ORTEGA HERNÁNDEZ REYNA", turno: "Primer Turno" },
  { id: 33, name: "OSORIO MEJÍA ALEJANDRO", turno: "Primer Turno" },
  { id: 34, name: "PEÑA PÉREZ JOSÉ ALBERTO", turno: "Primer Turno" },
  { id: 35, name: "PIÑA GALINDO JOSÉ FRANCISCO", turno: "Primer Turno" },
  { id: 36, name: "PLATA MUÑOZ SERGIO", turno: "Primer Turno" },
  { id: 37, name: "SALAZAR ESPINOZA MARTÍN", turno: "Primer Turno" },
  { id: 38, name: "SALVADOR ANCONA ÓSCAR", turno: "Primer Turno" },
  { id: 39, name: "SÁNCHEZ LUIS ROBERTO", turno: "Primer Turno" },
  { id: 40, name: "TOMAS GONZÁLEZ FABIÁN", turno: "Primer Turno" },
  { id: 41, name: "VALENTÍN ODILÓN REMIGIO", turno: "Primer Turno" },
  { id: 42, name: "VENTURA SÁNCHEZ JUAN", turno: "Primer Turno" },
  { id: 43, name: "VELÁZQUEZ ANTONIO EDUARDO", turno: "Primer Turno" },
  { id: 44, name: "ZETINA MENDOZA DANIEL", turno: "Primer Turno" },

  { id: 45, name: "ÁLVAREZ LUIS JOEL", turno: "Segundo Turno" },
  { id: 46, name: "ÁLVAREZ MARTÍNEZ MAURICIO", turno: "Segundo Turno" },
  { id: 47, name: "ANTONIO MENDOZA OMAR", turno: "Segundo Turno" },
  { id: 48, name: "BARRIOS PÉREZ TELESFORO", turno: "Segundo Turno" },
  { id: 49, name: "BETANCOURT ANTONIO CARLOS ALEJANDRO", turno: "Segundo Turno" },
  { id: 50, name: "BRACAMONTE GARCÍA GABRIEL", turno: "Segundo Turno" },
  { id: 51, name: "BRACAMONTE GARCÍA PRISCILIANO", turno: "Segundo Turno" },
  { id: 52, name: "CARRANZA GONZÁLEZ URIEL", turno: "Segundo Turno" },
  { id: 53, name: "CARREOLA SÁNCHEZ YOLIDIA", turno: "Segundo Turno" },
  { id: 54, name: "CASTAÑEDA JERÓNIMO ALEJANDRO", turno: "Segundo Turno" },
  { id: 55, name: "DÍAZ HERNÁNDEZ RIGOBERTO", turno: "Segundo Turno" },
  { id: 56, name: "DÍAZ MORALES CESAR", turno: "Segundo Turno" },
  { id: 57, name: "FELIPE DE JESÚS SANTOS", turno: "Segundo Turno" },
  { id: 58, name: "GABINO ANTONIO RAYMUNDO", turno: "Segundo Turno" },
  { id: 59, name: "GARCÍA SEGUNDO FELIPE", turno: "Segundo Turno" },
  { id: 60, name: "GARDUÑO GONZÁLEZ ALONSO", turno: "Segundo Turno" },
  { id: 61, name: "GONZÁLEZ AVILÉS DOMINGO", turno: "Segundo Turno" },
  { id: 62, name: "GUADALUPE SÁNCHEZ BLAS", turno: "Segundo Turno" },
  { id: 63, name: "HERNÁNDEZ LÓPEZ ALBERTO", turno: "Segundo Turno" },
  { id: 64, name: "HERNÁNDEZ PÉREZ JOAQUÍN", turno: "Segundo Turno" },
  { id: 65, name: "JIMÉNEZ GONZÁLEZ EFRAÍN", turno: "Segundo Turno" },
  { id: 66, name: "JIMÉNEZ GONZÁLEZ RAMÓN", turno: "Segundo Turno" },
  { id: 67, name: "LÓPEZ MATÍAS DAVID", turno: "Segundo Turno" },
  { id: 68, name: "LÓPEZ MORALES PEDRO", turno: "Segundo Turno" },
  { id: 69, name: "LORENZO ARANA JOSÉ ARMANDO", turno: "Segundo Turno" },
  { id: 70, name: "LORENZO ARANA ROBERTO", turno: "Segundo Turno" },
  { id: 71, name: "LUIS AMADO ISIDRO", turno: "Segundo Turno" },
  { id: 72, name: "MARTÍN FUENTES ARMANDO", turno: "Segundo Turno" },
  { id: 73, name: "MARTÍNEZ MEJÍA NEHUTALID", turno: "Segundo Turno" },
  { id: 74, name: "MONDRAGÓN ORTEGA ÁNGEL", turno: "Segundo Turno" },
  { id: 75, name: "MORENO MONROY FERNANDO", turno: "Segundo Turno" },
  { id: 76, name: "OCADIZ ROSAS JESÚS ANDRÉS", turno: "Segundo Turno" },
  { id: 77, name: "ONOFRE MALDONADO ALFONSO", turno: "Segundo Turno" },
  { id: 78, name: "ONOFRE VIEYRA VALENTÍN", turno: "Segundo Turno" },
  { id: 79, name: "RIVERA SÁNCHEZ ANDRÉS", turno: "Segundo Turno" },
  { id: 80, name: "PACHECO HERNÁNDEZ MIGUEL ÁNGEL", turno: "Segundo Turno" },
  { id: 81, name: "QUINTANA TORIBIO ELIASIM", turno: "Segundo Turno" },
  { id: 82, name: "SEGUNDO BARRIOS JUAN PABLO", turno: "Segundo Turno" },
  { id: 83, name: "SEGUNDO GASPAR DANIEL", turno: "Segundo Turno" },
  { id: 84, name: "SOTELO HERNÁNDEZ RICARDO", turno: "Segundo Turno" },
  { id: 85, name: "SUAREZ LÓPEZ DIEGO", turno: "Segundo Turno" },
  { id: 86, name: "TOMAS HERNÁNDEZ ADELAIDO", turno: "Segundo Turno" },
  { id: 87, name: "TORRES MEDINA ALEJANDRO", turno: "Segundo Turno" },
  { id: 88, name: "TREVIÑO MORENO RAFAEL", turno: "Segundo Turno" },
  { id: 89, name: "VALENTÍN PIÑA RICARDO", turno: "Segundo Turno" },
  { id: 90, name: "VÁZQUEZ ALCÁNTARA LUIS ALBERTO", turno: "Segundo Turno" }
];




export default function ArrestModal({ person, onClose, onSave }) {
  const [formData, setFormData] = useState({
    faltas_administrativas: [], // Cambiado a array
    comunidad: "",
    turno: "",
    arresting_officer: "",
    folio: "",
    rnd: "",
    sentencia: ""
  });
  const [currentFalta, setCurrentFalta] = useState("");
  const [otraFalta, setOtraFalta] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "turno" ? { arresting_officer: "" } : {}),
    }));
  };

  const handleAddFalta = () => {
    let faltaToAdd = currentFalta === "Otro" ? otraFalta.trim() : currentFalta;
    if (faltaToAdd && !formData.faltas_administrativas.includes(faltaToAdd)) {
      setFormData(prev => ({
        ...prev,
        faltas_administrativas: [...prev.faltas_administrativas, faltaToAdd]
      }));
      setCurrentFalta("");
      setOtraFalta("");
    }
  };

  const handleRemoveFalta = (faltaToRemove) => {
    setFormData(prev => ({
      ...prev,
      faltas_administrativas: prev.faltas_administrativas.filter(f => f !== faltaToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.faltas_administrativas.length === 0 ||
      !formData.comunidad.trim()
    ) {
      alert("Debes agregar al menos una Falta administrativa y seleccionar una Comunidad.");
      return;
    }

    const dataToSend = {
      person_id: person.id,
      // Unimos las faltas en un solo string separado por comas
      falta_administrativa: formData.faltas_administrativas.join(", "),
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
                {person.alias && ` "${person.alias}"`}
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
              Faltas Administrativas *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                name="currentFalta"
                value={currentFalta}
                onChange={(e) => setCurrentFalta(e.target.value)}
                style={{ ...styles.select, flex: 1 }}
              >
                <option value="">Selecciona una falta para agregar</option>
                {faltasAdministrativas.map((falta) => (
                  <option key={falta} value={falta}>{falta}</option>
                ))}
              </select>
              <button type="button" onClick={handleAddFalta} style={styles.addButton} title="Agregar Falta">
                <span className="material-symbols-outlined" style={{ color: '#333' }}>add</span>
              </button>
            </div>
          </div>

          {/* Campo para "Otra" falta */}
          {currentFalta === "Otro" && (
            <div style={styles.field}>
              <label style={styles.label}>Especificar Falta *</label>
              <input
                name="otraFalta"
                placeholder="Describe la falta administrativa"
                value={otraFalta}
                onChange={(e) => setOtraFalta(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          )}

          {/* Contenedor de faltas agregadas */}
          {formData.faltas_administrativas.length > 0 && (
            <div style={styles.tagsContainer}>
                {formData.faltas_administrativas.map((falta, index) => (
                  <div key={index} style={styles.tag}>
                    <span>{falta}</span>
                    <button type="button" onClick={() => handleRemoveFalta(falta)} style={styles.tagRemoveButton}>
                      &times;
                    </button>
                  </div>
                ))}
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
    maxWidth: "750px",
    maxHeight: "85vh",
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
    background: "linear-gradient(135deg, #4facfe 0%, #2ea3a9ff 100%)",
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
  },
  addButton: {
    background: 'linear-gradient(135deg, #4facfe 0%, #2ea3a9ff 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '0 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    background: 'rgba(0,0,0,0.2)',
    padding: '0.75rem',
    borderRadius: '10px',
    maxHeight: '110px', 
    overflowY: 'auto',  
    marginTop: '1rem',
  },
  tag: {
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#333',
    padding: '0.4rem 0.8rem',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  tagRemoveButton: {
    background: '#ccc',
    color: '#555',
    border: 'none',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
  }
};