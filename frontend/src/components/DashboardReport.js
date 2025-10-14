import React from 'react';

const DashboardReport = ({ summary, filter, onBack }) => {
  if (!summary) return null;

  const handlePrint = () => {
    window.print();
  };

  const getFilterTitle = () => {
    if (filter.year === 'all' && filter.month === 'all' && filter.day === 'all') {
      return 'Reporte General de Estadísticas';
    }
    let title = 'Reporte para: ';
    if (filter.day !== 'all') title += `Día ${filter.day} de `;
    if (filter.month !== 'all') {
      const monthName = new Date(0, filter.month - 1).toLocaleString('es-MX', { month: 'long' });
      title += `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} `;
    }
    if (filter.year !== 'all') title += `de ${filter.year}`;
    return title;
  };

  return (
    <div style={styles.reportContainer}>
      <div style={styles.reportHeader} className="no-print">
        <button onClick={onBack} style={styles.backButton}>
          <span className="material-symbols-outlined">arrow_back</span>
          Volver al Dashboard
        </button>
        <h1 style={styles.mainTitle}>Reporte de Estadísticas</h1>
        <button onClick={handlePrint} style={styles.printButton}>
          <span className="material-symbols-outlined">print</span>
          Imprimir Reporte
        </button>
      </div>

      <div style={styles.printableArea} className="printable-area">
        <div style={styles.watermark}>CONFIDENCIAL</div>

        {/* Encabezado del Informe */}
        <div style={styles.printHeader}>
          <img 
            src="https://th.bing.com/th/id/R.eb6e5629278a9adf8ffd6d85998747d0?rik=Syphi5ks4Z7ljA&riu=http%3a%2f%2fbe32.mx%2fjsons%2fimg%2fclientes%2fgdhfe-32.jpg&ehk=RPMsfcqAXz8my3Wi2%2bvR0cuElqjAHwjmUzytVmahTVo%3d&risl=&pid=ImgRaw&r=0" 
            alt="Logo" 
            style={styles.logo} 
          />
          <div>
            <h2 style={styles.printTitle}>Reporte de Actividad y Estadísticas</h2>
            <p style={styles.printSubtitle}>{getFilterTitle()}</p>
          </div>
          <p style={styles.printDate}>Fecha de Emisión: {new Date().toLocaleDateString('es-MX')}</p>
        </div>

        {/* Resumen de Estadísticas */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Resumen de Actividad</h3>
          <div style={styles.summaryGrid}>
            <SummaryItem label="Total de Arrestos en Periodo" value={summary.totalArrests} />
            <SummaryItem label="Total Personas Registradas (Histórico)" value={summary.totalPersons} />
          </div>
        </div>

        {/* Top Delitos */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Top 5 Faltas Administrativas</h3>
          {summary.topOffenses.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Falta</th>
                  <th style={styles.th}>Número de Casos</th>
                </tr>
              </thead>
              <tbody>
                {summary.topOffenses.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{item.offense}</td>
                    <td style={styles.td}>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={styles.noRecords}>No hay datos de faltas para este periodo.</p>}
        </div>

        {/* Top Personas con más arrestos */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Top 5 Personas con Más Arrestos</h3>
          {summary.topPersons.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Número de Arrestos</th>
                </tr>
              </thead>
              <tbody>
                {summary.topPersons.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{item.name}</td>
                    <td style={styles.td}>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={styles.noRecords}>No hay datos de personas para este periodo.</p>}
        </div>

        <div style={styles.printFooter}>
          <p>© {new Date().getFullYear()} Sistema Modular de Comando - Documento Confidencial</p>
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value }) => (
  <div style={styles.summaryItem}>
    <p style={styles.summaryLabel}>{label}</p>
    <p style={styles.summaryValue}>{value}</p>
  </div>
);

const baseButton = {
  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
  borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease',
};

const styles = {
  reportContainer: { padding: '2rem', color: '#fff' },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  mainTitle: { fontSize: '2rem', margin: 0 },
  backButton: { ...baseButton, background: 'rgba(255, 255, 255, 0.1)', color: '#fff' },
  printButton: { ...baseButton, background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)', color: '#fff' },
  
  printableArea: { background: 'rgba(10, 25, 41, 0.7)', color: '#fff', borderRadius: '8px', padding: '2rem', fontFamily: 'Arial, sans-serif', border: '1px solid rgba(255, 255, 255, 0.2)', position: 'relative', overflow: 'hidden' },
  
  printHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '1rem', marginBottom: '2rem' },
  logo: { width: '60px', height: '60px', borderRadius: '50%' },
  printTitle: { fontSize: '1.5rem', margin: 0, color: '#fff' },
  printSubtitle: { margin: 0, color: 'rgba(255, 255, 255, 0.8)' },
  printDate: { textAlign: 'right', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' },

  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.25rem', color: '#3a7bd5', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', paddingBottom: '0.5rem', marginBottom: '1rem' },
  
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' },
  summaryItem: { background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px' },
  summaryLabel: { margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' },
  summaryValue: { margin: 0, fontSize: '1.8rem', fontWeight: 'bold' },

  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: { background: 'rgba(58, 123, 213, 0.2)', padding: '12px', textAlign: 'left', borderBottom: '2px solid rgba(58, 123, 213, 0.5)' },
  td: { padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
  
  noRecords: { fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.7)' },

  printFooter: { textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' },
  
  watermark: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '6rem', color: 'rgba(255, 255, 255, 0.05)', fontWeight: 'bold', pointerEvents: 'none', zIndex: 0, textTransform: 'uppercase', letterSpacing: '1rem', whiteSpace: 'nowrap' },
};

const printStyles = `
  @media print {
    @page { size: A4; margin: 0; }
    body * { visibility: hidden; }
    .printable-area, .printable-area * { visibility: visible; }

    .printable-area {
      position: absolute;
      top: -300px;
      left: 0;
      width: 100%;
      margin: 0;
      padding: 1cm 1.5cm;
      box-sizing: border-box;
      background: #fff !important; color: #000 !important;
      font-family: Arial, Helvetica, sans-serif; line-height: 1.4;
    }
    .printable-area table, .printable-area th, .printable-area td {
      border-color: #ddd !important; color: #000 !important;
    }
    .printable-area h2, .printable-area h3, .printable-area p, .printable-area span, .printable-area th, .printable-area td {
      color: #000 !important;
    }
    .printable-area .printSubtitle, .printable-area .printDate, .printable-area .summaryLabel { color: #555 !important; }
    .printable-area .sectionTitle { color: #1e3c72 !important; }
    .printable-area .th { background: #f2f2f2 !important; }
    .printable-area .summaryItem { background: #f9f9f9 !important; border: 1px solid #eee; }
    .printable-area .watermark { color: rgba(0, 0, 0, 0.08) !important; }
    .no-print { display: none !important; }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet);

export default DashboardReport