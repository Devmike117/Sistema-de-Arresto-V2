import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const PersonReport = ({ reportData, onBack }) => {
  if (!reportData) return null;

  const { person, arrests } = reportData;
  const qrCanvasRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d
      .toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
      .replace(/\b\w/, c => c.toUpperCase());
  };

  // Generar código QR
  useEffect(() => {
    if (qrCanvasRef.current) {
      const qrData = {
        nombre: `${person.first_name} ${person.last_name}`,
        id: person.id_number || 'N/A',
        fechaNacimiento: person.dob || 'N/A',
        fechaReporte: new Date().toISOString(),
        totalArrestos: arrests.length
      };

      const qrText = JSON.stringify(qrData);

      QRCode.toCanvas(qrCanvasRef.current, qrText, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('Error generando QR:', error);
      });
    }
  }, [person, arrests]);

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
        {/* Marca de agua */}
        <div style={styles.watermark}>CONFIDENCIAL</div>

        {/* Encabezado del Informe Impreso */}
        <div style={styles.printHeader}>
          <img
            src="https://th.bing.com/th/id/R.eb6e5629278a9adf8ffd6d85998747d0?rik=Syphi5ks4Z7ljA&riu=http%3a%2f%2fbe32.mx%2fjsons%2fimg%2fclientes%2fgdhfe-32.jpg&ehk=RPMsfcqAXz8my3Wi2%2bvR0cuElqjAHwjmUzytVmahTVo%3d&risl=&pid=ImgRaw&r=0"
            alt="Logo"
            style={styles.logo}
          />
          <div style={{ flex: 1 }}>
            {/* <h3 style={styles.subTitle}>Sistema Modular de Comando</h3> ponerlo en encabezado y no en cuerpo*/}

            <h4 style={styles.mainEncabezado}>Dirección de Seguridad Pública Desarrollado Víal y Tránsito Municipal</h4>

            <h2 style={styles.printTitle}>Informe Confidencial de Persona</h2>
            <p style={styles.printSubtitle}>Generado por: Sistema Modular de Comando</p>
          </div>
          <div style={styles.qrSection}>
            <canvas ref={qrCanvasRef} style={styles.qrCanvas}></canvas>
            <p style={styles.qrLabel}>Código de Verificación</p>
            <p style={styles.printDate}>Fecha: {new Date().toLocaleDateString('es-MX')}</p>
          </div>
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
                  <th style={styles.th}>Fianza</th>
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
          <p>© {new Date().getFullYear()} Sistema Modular de Comando - Documento Confidencial</p>
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

  printableArea: {
    background: 'rgba(10, 25, 41, 0.7)',
    color: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },

  printHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: '2px solid rgba(255,255,255,0.2)',
    paddingBottom: '1rem',
    marginBottom: '2rem'
  },
  logo: { width: '60px', height: '60px', borderRadius: '50%' },
  printTitle: { fontSize: '1.5rem', margin: 0, color: '#fff' },
  printSubtitle: { margin: 0, color: 'rgba(255, 255, 255, 0.8)' },
  
  qrSection: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    gap: '0.5rem'
  },
  qrCanvas: { 
    border: '3px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    background: '#fff',
    padding: '5px'
  },
  qrLabel: { 
    fontSize: '0.75rem', 
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    fontWeight: 'bold'
  },
  printDate: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontSize: '0.85rem' },

  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.25rem', color: '#3a7bd5', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', paddingBottom: '0.5rem', marginBottom: '1rem' },

  sectiontEncabezado: { display: 'block', fontSize: '1.2rem', margin: 0, color: '#fff' },
  subTitle: { fontSize: '1rem', margin: 0, color: 'rgba(255, 255, 255, 0.8)' },
  mainEncabezado: { fontSize: '1.1rem', margin: '0.2rem 0', color: '#fff', fontWeight: '600' },



  personDetails: { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  personPhoto: { width: '150px', height: '150px', borderRadius: '8px', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' },
  infoGrid: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  infoLabel: { margin: 0, fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' },
  infoValue: { margin: 0, fontSize: '1rem' },

  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: { background: 'rgba(58, 123, 213, 0.2)', padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(58, 123, 213, 0.5)', color: '#fff' },
  td: { padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' },

  noRecords: { fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.7)' },

  printFooter: {
    textAlign: 'center',
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.7)'
  },

  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: '6rem',
    color: 'rgba(255, 255, 255, 0.15)',
    fontWeight: 'bold',
    pointerEvents: 'none',
    zIndex: 0,
    textTransform: 'uppercase',
    letterSpacing: '1rem',
    whiteSpace: 'nowrap'
  },
};

// === Estilos para impresión ===
const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 0;
    }

    body * {
      visibility: hidden;
    }

    .printable-area, .printable-area * {
      visibility: visible;
    }

    .printable-area {
      position: absolute;
      top: -250px;
      left: 0;
      width: 100%;
      margin: 0;
      padding: 1cm 1.5cm;
      box-sizing: border-box;
      background: #fff !important;
      color: #000 !important;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.4;
    }

    .printable-area table, .printable-area th, .printable-area td {
      border-color: #ddd !important;
      color: #000 !important;
    }

    .printable-area h2, .printable-area h3, .printable-area p, .printable-area span, .printable-area th, .printable-area td {
      color: #000 !important;
    }
    
    .printable-area .infoLabel, .printable-area .printSubtitle, .printable-area .printDate { color: #555 !important; }
    .printable-area .sectionTitle { color: #1e3c72 !important; }
    .printable-area .th { background: #f2f2f2 !important; }
    .printable-area .personPhoto { border-color: #ddd !important; }
    
    .printable-area canvas {
      border-color: #ddd !important;
    }

    .printable-area .watermark {
      color: rgba(0, 0, 0, 0.08) !important;
    }

    .no-print {
      display: none !important;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet);

export default PersonReport;