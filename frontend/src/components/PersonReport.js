import React from 'react';

const PersonReport = ({ reportData, onBack }) => {
  if (!reportData) return null;

  const { person, arrests } = reportData;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={styles.reportContainer}>
      <div style={styles.reportHeader} className="no-print">
        <button onClick={onBack} style={styles.backButton}>
          <span className="material-symbols-outlined">arrow_back</span>
          Volver al Dashboard
        </button>
        <h1 style={styles.mainTitle}>Informe de Persona</h1>
        <button onClick={handlePrint} style={styles.printButton}>
          <span className="material-symbols-outlined">print</span>
          Imprimir Informe
        </button>
      </div>

      <div style={styles.printableArea} className="printable-area">
        {/* Encabezado del Informe Impreso */}
        <div style={styles.printHeader}>
          <img 
            src="https://th.bing.com/th/id/R.eb6e5629278a9adf8ffd6d85998747d0?rik=Syphi5ks4Z7ljA&riu=http%3a%2f%2fbe32.mx%2fjsons%2fimg%2fclientes%2fgdhfe-32.jpg&ehk=RPMsfcqAXz8my3Wi2%2bvR0cuElqjAHwjmUzytVmahTVo%3d&risl=&pid=ImgRaw&r=0" 
            alt="Logo" 
            style={styles.logo} 
          />
          <div>
            <h2 style={styles.printTitle}>Informe Confidencial de Persona</h2>
            <p style={styles.printSubtitle}>Generado por: Sistema Modular de Comando</p>
          </div>
          <p style={styles.printDate}>Fecha: {new Date().toLocaleDateString('es-MX')}</p>
        </div>

        {/* Sección de Datos Personales */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Datos Personales</h3>
          <div style={styles.personDetails}>
            <img 
              src={`http://localhost:5000/${person.photo_path}`} 
              alt="Foto" 
              style={styles.personPhoto} 
            />
            <div style={styles.infoGrid}>
              <InfoItem label="Nombre Completo" value={`${person.first_name} ${person.last_name}`} />
              <InfoItem label="Alias" value={person.alias || 'N/A'} />
              <InfoItem label="Fecha de Nacimiento" value={formatDate(person.dob)} />
              <InfoItem label="Género" value={person.gender || 'N/A'} />
              <InfoItem label="Nacionalidad" value={person.nationality || 'N/A'} />
              <InfoItem label="ID (CURP/INE)" value={person.id_number || 'N/A'} />
              <InfoItem label="Dirección" value={`${person.community || ''}, ${person.municipality || ''}, ${person.state || ''}`} />
              <InfoItem label="Observaciones" value={person.observaciones || 'Ninguna'} isFullWidth={true} />
            </div>
          </div>
        </div>

        {/* Sección de Historial de Arrestos */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Historial de Arrestos ({arrests.length})</h3>
          {arrests.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Falta Administrativa</th>
                  <th style={styles.th}>Comunidad</th>
                  <th style={styles.th}>Oficial</th>
                  <th style={styles.th}>Sentencia</th>
                </tr>
              </thead>
              <tbody>
                {arrests.map(arrest => (
                  <tr key={arrest.id}>
                    <td style={styles.td}>{formatDate(arrest.arrest_date)}</td>
                    <td style={styles.td}>{arrest.falta_administrativa}</td>
                    <td style={styles.td}>{arrest.comunidad}</td>
                    <td style={styles.td}>{arrest.arresting_officer || 'N/A'}</td>
                    <td style={styles.td}>{arrest.sentencia || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={styles.noRecords}>No se encontraron arrestos para esta persona.</p>
          )}
        </div>

        <div style={styles.printFooter}>
          <p>© {new Date().getFullYear()} BioRegistro - Documento Confidencial</p>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, isFullWidth }) => (
  <div style={{ gridColumn: isFullWidth ? '1 / -1' : 'auto' }}>
    <p style={styles.infoLabel}>{label}</p>
    <p style={styles.infoValue}>{value}</p>
  </div>
);

const baseButton = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'all 0.2s ease',
};

const styles = {
  reportContainer: { padding: '2rem', color: '#fff' },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  mainTitle: { fontSize: '2rem', margin: 0 },
  backButton: { ...baseButton, background: 'rgba(255, 255, 255, 0.1)', color: '#fff' },
  printButton: { ...baseButton, background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)', color: '#fff' },
  
  printableArea: { background: '#fff', color: '#333', borderRadius: '8px', padding: '2rem', fontFamily: 'Arial, sans-serif' },
  
  printHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '1rem', marginBottom: '2rem' },
  logo: { width: '60px', height: '60px', borderRadius: '50%' },
  printTitle: { fontSize: '1.5rem', margin: 0, color: '#1e3c72' },
  printSubtitle: { margin: 0, color: '#555' },
  printDate: { textAlign: 'right', color: '#555' },

  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.25rem', color: '#2a5298', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem' },
  
  personDetails: { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  personPhoto: { width: '150px', height: '150px', borderRadius: '8px', objectFit: 'cover', border: '3px solid #ddd' },
  infoGrid: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  infoLabel: { margin: 0, fontWeight: 'bold', color: '#555', fontSize: '0.9rem' },
  infoValue: { margin: 0, fontSize: '1rem' },

  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: { background: '#f2f2f2', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' },
  td: { padding: '12px', borderBottom: '1px solid #eee' },
  
  noRecords: { fontStyle: 'italic', color: '#777' },

  printFooter: { textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ccc', fontSize: '0.8rem', color: '#888' },
};

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .printable-area, .printable-area * {
      visibility: visible;
    }
    .printable-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 1.5cm;
      box-sizing: border-box;
      background: #fff !important;
      color: #000 !important;
    }
    .no-print {
      display: none !important;
    }
    .printable-area h2, .printable-area h3, .printable-area p, .printable-area span, .printable-area th, .printable-area td {
        color: #000 !important;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet);

export default PersonReport;