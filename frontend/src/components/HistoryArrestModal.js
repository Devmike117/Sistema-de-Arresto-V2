import React, { useState, useEffect } from "react";

export default function HistoryArrestModal({ 
  open, 
  onClose, 
  arrests = [], 
  person,
  onMessage // Sin valor por defecto
}) {
  const [editingSentencia, setEditingSentencia] = useState({});
  const [sentenciaValues, setSentenciaValues] = useState({});
  const [localArrests, setLocalArrests] = useState(arrests);

  // Sincronizar con arrests externos
  useEffect(() => {
    setLocalArrests(arrests);
  }, [arrests]);

  if (!open) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleEditSentencia = (arrestId) => {
    setEditingSentencia({ ...editingSentencia, [arrestId]: true });
    const arrest = localArrests.find(a => a.id === arrestId);
    setSentenciaValues({ ...sentenciaValues, [arrestId]: arrest?.sentencia || "" });
  };

  const handleCancelEditSentencia = (arrestId) => {
    setEditingSentencia({ ...editingSentencia, [arrestId]: false });
    setSentenciaValues({ ...sentenciaValues, [arrestId]: "" });
  };

  const handleSaveSentencia = async (arrestId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/arrests/${arrestId}/sentencia`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentencia: sentenciaValues[arrestId] || "" }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Actualizar el estado local inmediatamente
        setLocalArrests(prev => 
          prev.map(arrest => 
            arrest.id === arrestId 
              ? { ...arrest, sentencia: sentenciaValues[arrestId] || "" }
              : arrest
          )
        );

        // Cerrar modo edición
        setEditingSentencia({ ...editingSentencia, [arrestId]: false });

        // Mostrar notificación solo si existe la función
        if (onMessage) {
          onMessage({ 
            type: "success", 
            text: data.message || "Sentencia actualizada correctamente" 
          });
        }
      } else {
        if (onMessage) {
          onMessage({ 
            type: "error", 
            text: data.error || "Error al actualizar sentencia" 
          });
        }
      }
    } catch (err) {
      console.error(err);
      if (onMessage) {
        onMessage({ 
          type: "error", 
          text: "Error al actualizar sentencia" 
        });
      }
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.iconContainer}>
              <span style={styles.icon}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.8rem', color: '#fff' }}>history</span>
              </span>
            </div>
            <div>
              <h2 style={styles.title}>Historial de Arrestos</h2>
              {person && (
                <p style={styles.subtitle}>
                  <span style={styles.personIcon}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>person</span>
                  </span>
                  {person.first_name} {person.last_name}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={styles.closeButton}
            onMouseEnter={(e) => e.target.style.background = 'rgba(245, 87, 108, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>close</span>
          </button>
        </div>

        {/* Contenido */}
        <div style={styles.content}>
          {localArrests.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>inbox</span>
              </span>
              <p style={styles.emptyText}>No hay arrestos registrados</p>
              <p style={styles.emptySubtext}>
                Esta persona no tiene historial de arrestos en el sistema
              </p>
            </div>
          ) : (
            <>
              {/* Badge con contador */}
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>gavel</span>
                </span>
                {localArrests.length} {localArrests.length === 1 ? 'arresto registrado' : 'arrestos registrados'}
              </div>

              {/* Lista de arrestos */}
              <div style={styles.arrestList}>
                {localArrests.map((a, idx) => (
                  <div key={a.id || idx} style={styles.arrestCard}>
                    {/* Header del arresto */}
                    <div style={styles.arrestHeader}>
                      <span style={styles.arrestNumber}>#{idx + 1}</span>
                      <span style={styles.arrestDate}>
                        <span style={styles.dateIcon}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>event</span>
                        </span>
                        {formatDate(a.arrest_date)}
                      </span>
                    </div>

                    {/* Información principal */}
                    <div style={styles.arrestInfo}>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>
                          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>gavel</span>
                          Falta:</span>
                        <span style={styles.infoValue}>{a.falta_administrativa || "N/A"}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>
                          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>location_city</span>
                          Comunidad:</span>
                        <span style={styles.infoValue}>{a.comunidad || "N/A"}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>
                          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>local_police</span>
                          Oficial:</span>
                        <span style={styles.infoValue}>{a.arresting_officer || "N/A"}</span>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div style={styles.additionalInfo}>
                      <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                          <span style={styles.itemLabel}>
                            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>description</span>
                            Folio</span>
                          <span style={styles.itemValue}>{a.folio || "N/A"}</span>
                        </div>
                        <div style={styles.infoItem}>
                          <span style={styles.itemLabel}>
                            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>description</span>
                            RND</span>
                          <span style={styles.itemValue}>{a.rnd || "N/A"}</span>
                        </div>

                        {/* Sentencia editable */}
                        <div style={styles.infoItem}>
                          <span style={styles.itemLabel}>
                            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>description</span>
                            Sentencia</span>
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
                                onMouseEnter={(e) => e.target.style.background = '#059669'}
                                onMouseLeave={(e) => e.target.style.background = '#10b981'}
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
                                onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                                onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                              >
                                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '18px' }}>
                                  close
                                </span>
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginTop: '4px' }}>
                              <span style={styles.itemValue}>{a.sentencia || "N/A"}</span>
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
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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
            </>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button 
            onClick={onClose} 
            style={styles.closeFooterButton}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Cerrar
          </button>
        </div>
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
    maxWidth: "700px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "1.5rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    flexShrink: 0
  },

  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  },

  iconContainer: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "0.75rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
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
    outline: "none",
    flexShrink: 0
  },

  content: {
    padding: "1.5rem",
    overflowY: "auto",
    flex: 1
  },

  badge: {
    background: "rgba(79, 172, 254, 0.2)",
    color: "#fff",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    border: "1px solid rgba(79, 172, 254, 0.3)"
  },

  badgeIcon: {
    fontSize: "1.2rem"
  },

  arrestList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },

  arrestCard: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.25rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.3s ease"
  },

  arrestHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
  },

  arrestNumber: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#fff",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(245, 87, 108, 0.3)"
  },

  arrestDate: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "0.9rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },

  dateIcon: {
    fontSize: "1rem"
  },

  arrestInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1rem"
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
    minWidth: "120px",
    flexShrink: 0
  },

  infoValue: {
    fontSize: "0.9rem",
    color: "#fff",
    flex: 1
  },

  additionalInfo: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem"
  },

  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem"
  },

  itemLabel: {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600"
  },

  itemValue: {
    fontSize: "0.9rem",
    color: "#fff",
    fontWeight: "500"
  },

  emptyState: {
    textAlign: "center",
    padding: "3rem 1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
    opacity: 0.5
  },

  emptyText: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#fff",
    margin: "0 0 0.5rem 0"
  },

  emptySubtext: {
    fontSize: "0.95rem",
    color: "rgba(255, 255, 255, 0.6)",
    margin: 0
  },

  footer: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    justifyContent: "center",
    flexShrink: 0
  },

  closeFooterButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.75rem 2rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
    outline: "none"
  }
};