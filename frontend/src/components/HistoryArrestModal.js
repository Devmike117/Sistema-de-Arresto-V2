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
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.iconContainer}>
              <span style={styles.icon}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>history</span>
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
          {arrests.length === 0 ? (
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
                {arrests.length} {arrests.length === 1 ? 'arresto registrado' : 'arrestos registrados'}
              </div>

              {/* Lista de arrestos */}
              <div style={styles.arrestList}>
                {arrests.map((a, idx) => (
                  <div key={idx} style={styles.arrestCard}>
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
                      </div>
                      {a.sentencia && a.sentencia !== "N/A" && (
                        <div style={styles.sentenciaBox}>
                          <span style={styles.sentenciaLabel}>
                            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>balance</span>
                            Sentencia:</span>
                          <p style={styles.sentenciaText}>{a.sentencia}</p>
                        </div>
                      )}
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

  sentenciaBox: {
    marginTop: "0.5rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)"
  },

  sentenciaLabel: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: "0.5rem",
    display: "block"
  },

  sentenciaText: {
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.9)",
    margin: 0,
    lineHeight: "1.5"
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