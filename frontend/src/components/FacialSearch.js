import React, { useState } from "react";
import FacialCapture from "./FacialCapture";
import ArrestModal from "./ArrestModal";
import API_BASE_URL from '../config';

export default function FacialSearch({ onMessage }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSentencia, setEditingSentencia] = useState({});
  const [sentenciaValues, setSentenciaValues] = useState({});  

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

      const res = await fetch(`${API_BASE_URL}/api/search_face`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        onMessage({ type: "error", text: data.error || "Error en la búsqueda" });
      } else if (!data.person) {
        // Aquí detectamos que no se encontró rostro o no hay coincidencias
        onMessage({ type: "error", text: "No se detectó un rostro en la imagen o no hay coincidencias" });
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
      const res = await fetch(`${API_BASE_URL}/api/arrests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person_id: result.person.id, ...arrestData }),
      });

      const data = await res.json();
      if (res.ok) {
        onMessage({ type: "success", text: "Arresto registrado correctamente" });
        setShowModal(false);
        handleSearch();
      } else {
        onMessage({ type: "error", text: data.error || "Error al registrar arresto" });
      }
    } catch (err) {
      console.error(err);
      onMessage({ type: "error", text: "Error al registrar arresto" });
    }
  };

  // Funciones para editar sentencia
  const handleEditSentencia = (arrestId) => {
    setEditingSentencia({ ...editingSentencia, [arrestId]: true });
    const arrest = result.person.arrests.find(a => a.id === arrestId);
    setSentenciaValues({ ...sentenciaValues, [arrestId]: arrest?.sentencia || "" });
  };

  const handleCancelEditSentencia = (arrestId) => {
    setEditingSentencia({ ...editingSentencia, [arrestId]: false });
    setSentenciaValues({ ...sentenciaValues, [arrestId]: "" });
  };

  const handleSaveSentencia = async (arrestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/arrests/${arrestId}/sentencia`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentencia: sentenciaValues[arrestId] || "" }),
      });

      const data = await res.json();
      if (res.ok) {
        onMessage({ type: "success", text: "Sentencia actualizada correctamente" });
        setEditingSentencia({ ...editingSentencia, [arrestId]: false });
        handleSearch();
      } else {
        onMessage({ type: "error", text: data.error || "Error al actualizar sentencia" });
      }
    } catch (err) {
      console.error(err);
      onMessage({ type: "error", text: "Error al actualizar sentencia" });
    }
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.leftColumn}>
        <FacialCapture photoFile={photoFile} setPhotoFile={setPhotoFile} onMessage={onMessage} />

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            ...styles.searchButton,
            ...(loading ? styles.searchButtonDisabled : {})
          }}
          onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
        >
          <span style={styles.buttonIcon}>
            {loading ? (
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>autorenew</span>
            ) : (
              <span className="material-symbols-outlined">search</span>
            )}
          </span>
          {loading ? "Buscando..." : "Buscar Persona"}
        </button>

        {!result && (
          <div style={styles.instructionBox}>
            <span style={styles.instructionIcon}>
              <span className="material-symbols-outlined" style={{ color: '#fff' }}>lightbulb_2</span>
            </span>
            <p style={styles.instructionText}>
              Captura una foto facial y presiona "Buscar Persona" para iniciar la búsqueda en la base de datos
            </p>
          </div>
        )}
      </div>




      {/* Columna Derecha - Solo cuando hay resultados */}
      {result && (
        <div style={styles.rightColumn}>
          <div style={styles.resultContainer}>
            <div style={styles.resultHeader}>
              <div style={styles.resultIconContainer}>
                <span style={styles.resultIcon}>
                  {result.found ? (
                    <span className="material-symbols-outlined">check</span>
                  ) : (
                    <span className="material-symbols-outlined">close</span>
                  )}
                </span>
              </div>
              <h2 style={styles.resultTitle}>
                {result.found ? 'Persona Encontrada' : 'Sin Coincidencias'}
              </h2>
            </div>

            {result.found ? (
              <>
                {/* Información principal */}
                <div style={styles.personCard}>
                  <div style={styles.photoContainer}>
                    <img
                      src={`${API_BASE_URL}/${result.person.photo_path}`}
                      alt="Foto de la persona"
                      style={styles.photo}
                    />
                  </div>

                  <div style={styles.personInfo}>
                    <h3 style={styles.personName}>
                      {result.person.first_name} {result.person.last_name}
                      {result.person.alias && (
                        <span style={styles.alias}> "{result.person.alias}"</span>
                      )}
                    </h3>

                    <div style={styles.infoGrid}>
                      <InfoItem icon={<span className="material-symbols-outlined">calendar_month</span>} label="Fecha de Nac." value={formatDate(result.person.dob)} />
                      <InfoItem icon={<span className="material-symbols-outlined">transgender</span>} label="Género" value={result.person.gender || "N/A"} />
                      <InfoItem icon={<span className="material-symbols-outlined">globe</span>} label="Nacionalidad" value={result.person.nationality || "N/A"} />
                      <InfoItem icon={<span className="material-symbols-outlined">location_on</span>} label="Estado" value={result.person.state || "N/A"} />
                      <InfoItem icon={<span className="material-symbols-outlined">apartment</span>} label="Municipio" value={result.person.municipality || "N/A"} />
                      <InfoItem icon={<span className="material-symbols-outlined">home</span>} label="Comunidad" value={result.person.community || "N/A"} />
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div style={styles.additionalSection}>
                  <h4 style={styles.sectionTitle}>
                    <span style={styles.sectionIcon}>
                      <span className="material-symbols-outlined">info</span>
                    </span>
                    Información Personal
                  </h4>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>
                        <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                    id_card
                  </span>
                         ID:</span>
                      <span style={styles.infoValue}>{result.person.id_number || "N/A"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>
                        <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                          notes
                        </span>
                        Notas:</span>
                      <span style={styles.infoValue}>{result.person.observaciones || "Sin notas"}</span>
                    </div>
                  </div>
                </div>

                {/* Historial de arrestos */}
                <div style={styles.arrestSection}>
                  <div style={styles.arrestHeader}>
                    <h4 style={styles.sectionTitle}>
                      <span style={styles.sectionIcon}>

                        <span className="material-symbols-outlined">gavel</span>
                      </span>
                      Historial de Arrestos
                    </h4>
                    {result.person.arrests && result.person.arrests.length > 0 && (
                      <span style={styles.arrestBadge}>
                        {result.person.arrests.length} {result.person.arrests.length === 1 ? 'arresto' : 'arrestos'}
                      </span>
                    )}
                  </div>

                  {result.person.arrests && result.person.arrests.length > 0 ? (
                    <div style={styles.arrestList}>
                      {result.person.arrests.map((a, index) => (
                        <div key={index} style={styles.arrestCard}>
                          <div style={styles.arrestNumber}>#{index + 1}</div>
                          <div style={styles.arrestContent}>
                            <div style={styles.arrestColumn}>
                              <div style={styles.arrestItem}>
                                <span style={styles.arrestLabel}>
                                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>
                                    calendar_today
                                  </span>
                                  <span style={{ color: '#000000ff' }}>Fecha:</span>
                                </span>
                                <span style={styles.arrestValue}>{formatDate(a.arrest_date)}</span>
                              </div>
                              <div style={styles.arrestItem}>
                                <span style={styles.arrestLabel}>
                                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>
                                    warning
                                  </span>
                                  <span style={{ color: '#000000ff' }}>Falta:</span>
                                </span>
                                <span style={styles.arrestValue}>{a.falta_administrativa || "N/A"}</span>
                              </div>
                              <div style={styles.arrestItem}>
                                <span style={styles.arrestLabel}>
                                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>
                                    location_on
                                  </span>
                                  <span style={{ color: '#000000ff' }}>Comunidad:</span>
                                </span>
                                <span style={styles.arrestValue}>{a.comunidad || "N/A"}</span>
                              </div>
                            </div>
                            <div style={styles.arrestColumn}>
                              <div style={styles.arrestItem}>
                                <span style={styles.arrestLabel}>
                                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>
                                    local_police
                                  </span>
                                  <span style={{ color: '#000000ff' }}>Oficial:</span>
                                </span>
                                <span style={styles.arrestValue}>{a.arresting_officer || "N/A"}</span>
                              </div>
                              <div style={styles.arrestItem}>
                                <span style={styles.arrestLabel}>
                                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>
                                    description
                                  </span>
                                  <span style={{ color: '#000000ff' }}>Folio:</span>
                                </span>
                                <span style={styles.arrestValue}>{a.folio || "N/A"}</span>
                              </div>
                              <div style={styles.arrestItem}>
                                <span style={styles.arrestLabel}>
                                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>
                                    description
                                  </span>
                                  <span style={{ color: '#000000ff' }}>RND:</span>
                                </span>
                                <span style={styles.arrestValue}>{a.rnd || "N/A"}</span>
                              </div>
                              {/* Mostrar sección de sentencia y editarla */}
                              <div style={styles.arrestItem}>
                                <span style={styles.arrestLabel}>
                                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#000000ff' }}>
                                    description
                                  </span>
                                  <span style={{ color: '#000000ff' }}>Sentencia:</span>
                                </span>
                                {editingSentencia[a.id] ? (
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', marginTop: '4px' }}>
                                    <input
                                      type="text"
                                      value={sentenciaValues[a.id] || ""}
                                      onChange={(e) => setSentenciaValues({ ...sentenciaValues, [a.id]: e.target.value })}
                                      style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: '2px solid #4facfe',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        color: '#000',
                                      }}
                                      placeholder="Ingrese la sentencia"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveSentencia(a.id)}
                                      style={{
                                        padding: '8px 14px',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease',
                                      }}
                                      title="Guardar"
                                    >
                                      <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '18px' }}>
                                        check
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => handleCancelEditSentencia(a.id)}
                                      style={{
                                        padding: '8px 14px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease',
                                      }}
                                      title="Cancelar"
                                    >
                                      <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '18px' }}>
                                        close
                                      </span>
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginTop: '4px' }}>
                                    <span style={styles.arrestValue}>{a.sentencia || "N/A"}</span>
                                    <button
                                      onClick={() => handleEditSentencia(a.id)}
                                      style={{
                                        padding: '6px 12px',
                                        background: 'linear-gradient(135deg, #4facfe 0%, #2ea3a9ff 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 8px rgba(79, 172, 254, 0.3)',
                                      }}
                                      title="Editar sentencia"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                        edit
                                      </span>
                                      Editar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.noArrests}>
                      <span style={styles.noArrestsIcon}>
                        <span className="material-symbols-outlined">history_toggle_off</span>
                      </span>
                      <p style={styles.noArrestsText}>No hay arrestos registrados</p>
                    </div>
                  )}
                </div>

                {/* Botón de acción */}
                <div style={styles.actionSection}>
                  <button
                    onClick={() => setShowModal(true)}
                    style={styles.arrestButton}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <span style={styles.buttonIcon}>
                      <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '20px' }}>add</span>
                    </span>
                    Registrar Nuevo Arresto
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.notFound}>
                <span style={styles.notFoundIcon}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '20px' }}>face_6</span>
                </span>
                <p style={styles.notFoundText}>No se encontró ninguna coincidencia</p>
                <p style={styles.notFoundSubtext}>Intenta con otra foto o verifica la calidad de la imagen</p>
              </div>
            )}
          </div>
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

// Componente auxiliar para items de información
const InfoItem = ({ icon, label, value }) => (
  <div style={styles.infoItem}>
    <span style={styles.itemIcon}>{icon}</span>
    <div>
      <div style={styles.itemLabel}>{label}</div>
      <div style={styles.itemValue}>{value}</div>
    </div>
  </div>
);

const styles = {
  mainContainer: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "2rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    '@media (min-width: 1024px)': {
      gridTemplateColumns: "1fr 1fr"
    }
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    alignItems: "center"
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column"
  },

  searchButton: {
    background: "linear-gradient(135deg, #4facfe 0%, #2ea3a9ff 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "1rem 2.5rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    boxShadow: "0 8px 20px rgba(79, 172, 254, 0.4)",
    transition: "all 0.3s ease",
    outline: "none",
    width: "100%",
    maxWidth: "300px",
    justifyContent: "center"
  },

  searchButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed"
  },

  buttonIcon: {
    fontSize: "1.3rem"
  },

  instructionBox: {
    background: "rgba(79, 172, 254, 0.1)",
    border: "1px solid rgba(79, 172, 254, 0.3)",
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
    maxWidth: "500px"
  },

  instructionIcon: {
    fontSize: "2rem",
    flexShrink: 0
  },

  instructionText: {
    fontSize: "0.95rem",
    color: "rgba(255, 255, 255, 0.9)",
    margin: 0,
    lineHeight: "1.5"
  },

  resultContainer: {
    width: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "2rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    maxHeight: "calc(100vh - 150px)",
    overflowY: "auto"
  },

  resultHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
  },
//icno circular con gradiente
  resultIconContainer: {
    background: "linear-gradient(135deg, #4ffe69ff 0%, #10dc58ff 100%)",
    padding: "0.75rem",
    borderRadius: "90px",
    overflow: "hidden",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(79, 172, 254, 0.3)"
  },

  resultIcon: {
    fontSize: "1.8rem",
    color: "#fff"
  },

  resultTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
  },

  personCard: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap"
  },

  photoContainer: {
    flexShrink: 0
  },

  photo: {
    width: "150px",
    height: "150px",
    borderRadius: "12px",
    objectFit: "cover",
    border: "3px solid rgba(79, 212, 102, 0.5)",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)"
  },

  personInfo: {
    flex: "1 1 300px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },

  personName: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
  },

  alias: {
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
    fontSize: "1.2rem"
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "0.75rem"
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px"
  },

  itemIcon: {
    fontSize: "1.2rem"
  },

  itemLabel: {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500"
  },

  itemValue: {
    fontSize: "0.9rem",
    color: "#fff",
    fontWeight: "600"
  },

  additionalSection: {
    marginBottom: "1.5rem"
  },

  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },

  sectionIcon: {
    fontSize: "1.3rem"
  },

  infoBox: {
    background: "rgba(255, 255, 255, 0.05)",
    padding: "1rem",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },

  infoRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "baseline"
  },

  infoLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    minWidth: "80px"
  },

  infoValue: {
    fontSize: "0.9rem",
    color: "#fff",
    flex: 1
  },

  arrestSection: {
    marginBottom: "1.5rem"
  },

  arrestHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "0.5rem"
  },

  arrestBadge: {
    background: "rgba(245, 87, 108, 0.2)",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    border: "1px solid rgba(245, 87, 108, 0.3)"
  },

  arrestList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },

  arrestCard: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "10px",
    padding: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start"
  },

  arrestNumber: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#fff",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "700",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(245, 87, 108, 0.3)"
  },

  arrestContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    flex: 1
  },

  arrestColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },

  arrestItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem"
  },

  arrestLabel: {
    fontSize: "0.8rem",
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600"
  },

  arrestValue: {
    fontSize: "0.9rem",
    color: "#fff"
  },

  noArrests: {
    textAlign: "center",
    padding: "2rem",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "10px"
  },

  noArrestsIcon: {
    fontSize: "3rem",
    display: "block",
    marginBottom: "0.5rem",
    opacity: 0.5
  },

  noArrestsText: {
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.7)",
    margin: 0
  },

  actionSection: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)"
  },

  arrestButton: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: "0 4px 15px rgba(245, 87, 108, 0.4)",
    transition: "all 0.3s ease",
    outline: "none"
  },

  notFound: {
    textAlign: "center",
    padding: "3rem 1rem"
  },

  notFoundIcon: {
    fontSize: "4rem",
    display: "block",
    marginBottom: "1rem",
    opacity: 0.5
  },

  notFoundText: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#fff",
    margin: "0 0 0.5rem 0"
  },

  notFoundSubtext: {
    fontSize: "0.95rem",
    color: "rgba(255, 255, 255, 0.6)",
    margin: 0
  }
};
