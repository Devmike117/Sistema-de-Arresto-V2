import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import DashboardModal from "./DashboardModal";
import PersonReport from "./PersonReport";
import DashboardReport from "./DashboardReport"; // Importar el nuevo componente

// Componente CustomSelect mejorado
function CustomSelect({ value, options, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(placeholder);

  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    setSelectedLabel(selected ? selected.label : placeholder);
  }, [value, options, placeholder]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.75rem 2.5rem 0.75rem 1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          color: '#fff',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
          textAlign: 'left',
          position: 'relative',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {selectedLabel}
        <span style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
          transition: 'transform 0.2s',
        }}>▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            background: '#2c3e50',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  padding: '0.75rem 1rem',
                  color: '#fff',
                  cursor: 'pointer',
                  background: value === option.value ? 'rgba(102, 126, 234, 0.3)' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = value === option.value ? 'rgba(102, 126, 234, 0.3)' : 'transparent'}
              >
                {option.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard({ onMessage }) {
  const [summary, setSummary] = useState({
    totalPersons: 0,
    totalArrests: 0,
    topOffenses: [],
    topPersons: [],
  });
  const [filter, setFilter] = useState({
    year: 'all',
    month: 'all',
    day: 'all',
  });

  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportSearchResults, setReportSearchResults] = useState([]);
  const [isSearchingReport, setIsSearchingReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showDashboardReport, setShowDashboardReport] = useState(false); // Estado para el reporte del dashboard
  const [arrests, setArrests] = useState([]);
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: "",
    data: [],
    renderItem: () => null,
  });

  // Opciones para los filtros
  const yearOptions = [
    { value: 'all', label: 'Todos los Años' },
    ...Array.from({ length: 5 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      return { value: year.toString(), label: year.toString() };
    })
  ];

  const monthOptions = [
    { value: 'all', label: 'Todos los Meses' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: new Date(0, i).toLocaleString('es-MX', { month: 'long' })
    }))
  ];

  const dayOptions = [
    { value: 'all', label: 'Todos los Días' },
    ...Array.from({ length: 31 }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString()
    }))
  ];

  const fetchDashboard = async () => {
    try {
      const queryParams = new URLSearchParams(filter).toString();

      const statsRes = await fetch(`http://localhost:5000/api/dashboard/stats?${queryParams}`);
      const statsData = await statsRes.json();

      const recentRes = await fetch(`http://localhost:5000/api/dashboard/recent-arrests?${queryParams}`);
      const recentData = await recentRes.json();

      if (!statsRes.ok || !recentRes.ok) {
        throw new Error('Error al cargar los datos del dashboard');
      }

      const recentArrests = recentData.recentArrests.map((a) => ({
        ...a,
        person_name: `${a.first_name || ""} ${a.last_name || ""}${a.alias ? ` "${a.alias}"` : ""}`.trim(),
        offense: a.falta_administrativa || "Sin especificar",
        location: a.comunidad || "N/A",
        bail_status: a.fianza !== undefined ? a.fianza : "N/A",
      }));

      setSummary({
        totalPersons: statsData.totalPersons,
        totalArrests: statsData.totalArrests,
        topOffenses: statsData.topOffenses,
        topPersons: statsData.topPersons || [],
      });

      setArrests(recentArrests);
    } catch (err) {
      console.error(err);
      if (onMessage) onMessage({ type: "error", text: "Error al cargar dashboard" });
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filter]);

  const handleOpenModal = async (type) => {
    let title = "";
    let data = [];
    let renderItem = (item) => <div>{JSON.stringify(item)}</div>;

    try {
      switch (type) {
        case "persons":
          title = "Personas Registradas";
          const personsRes = await fetch("http://localhost:5000/api/dashboard/all-persons");
          const personsData = await personsRes.json();
          data = personsData.persons;
          renderItem = (item, index) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ flex: 1 }}>{index + 1}. {item.first_name} {item.last_name}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`http://localhost:5000/api/dashboard/privacy-notice/${item.id}`, '_blank');
                  }}
                  style={{ 
                    padding: '5px 10px', 
                    background: '#667eea', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '16px' }}>shield_person</span>
                  Aviso
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReport(item.id);
                  }}
                  style={{ padding: '5px 10px', background: '#3a7bd5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '16px' }}>description</span>
                  Informe
                </button>
              </div>
            </div>
          );
          break;
        case "arrests":
          title = "Todos los Arrestos";
          const arrestsRes = await fetch("http://localhost:5000/api/dashboard/all-arrests");
          const arrestsData = await arrestsRes.json();
          data = arrestsData.arrests;
          renderItem = (item, index) => <span>{index + 1}. {item.first_name} {item.last_name} - {item.falta_administrativa} ({new Date(item.arrest_date).toLocaleDateString()})</span>;
          break;
        case "offenses":
          title = "Distribución de Delitos";
          data = summary.topOffenses;
          renderItem = (item) => (
            <>
              <span>{item.offense}</span>
              <span style={{ fontWeight: 'bold' }}>{item.count}</span>
            </>
          );
          break;
        case "top-persons":
          title = "Personas con Más Arrestos";
          data = summary.topPersons;
          renderItem = (item) => (
            <>
              <span>{item.name}</span>
              <span style={{ fontWeight: 'bold' }}>{item.count} arrestos</span>
            </>
          );
          break;
        default:
          return;
      }
      setModalData({ isOpen: true, title, data, renderItem });
    } catch (err) {
      if (onMessage) onMessage({ type: "error", text: `Error al cargar ${title}` });
    }
  };

  const handleGenerateReport = async (personId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/person-report/${personId}`);
      if (!res.ok) throw new Error('No se pudo cargar el informe.');
      const data = await res.json();
      setReportData(data);
      setModalData({ isOpen: false, title: "", data: [], renderItem: () => null });
    } catch (err) {
      if (onMessage) onMessage({ type: "error", text: err.message });
    }
  };

  const handleReportSearch = async (e) => {
    e.preventDefault();
    if (!reportSearchTerm.trim()) {
      if (onMessage) onMessage({ type: 'warning', text: 'Ingrese un nombre para buscar.' });
      return;
    }
    setIsSearchingReport(true);
    setReportSearchResults([]);
    try {
      const res = await fetch(`http://localhost:5000/api/search_face/by_name?q=${encodeURIComponent(reportSearchTerm)}`);
      if (!res.ok) throw new Error('Error en la búsqueda');
      
      const data = await res.json();
      setReportSearchResults(data.results);
      if (data.results.length === 0 && onMessage) {
        onMessage({ type: 'info', text: 'No se encontraron personas con ese nombre.' });
      }
    } catch (err) {
      if (onMessage) onMessage({ type: 'error', text: err.message });
    } finally {
      setIsSearchingReport(false);
    }
  };

  if (showDashboardReport) return <DashboardReport summary={summary} filter={filter} onBack={() => setShowDashboardReport(false)} />;

  if (reportData) return <PersonReport reportData={reportData} onBack={() => setReportData(null)} />;

  return (
    <div style={{
      padding: "2rem",
      background: "linear-gradient(135deg, #2c3e50 0%, #4b6cb7 100%)",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>

      {/* ===== HEADER CON ÍCONO ===== */}
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#fff' }}>Dashboard</span>
        </div>
         <div>
         <h3 style={styles.title}>Dashboard</h3>
         <p style={styles.subtitle}>
          Resumen y estadísticas del sistema de arrestos
          </p>
        </div>
       </div>

      {/* Filtros */}
      <div style={{...styles.filterContainer, position: 'relative', zIndex: 10}}>
        <h3 style={styles.filterTitle}>
          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '24px' }}>filter_alt</span>
          Filtrar Arrestos por Fecha
        </h3>
        <div style={styles.filterControls}>
          <CustomSelect
            value={filter.year}
            options={yearOptions}
            onChange={(value) => setFilter(prev => ({ ...prev, year: value }))}
            placeholder="Todos los Años"
          />
          <CustomSelect
            value={filter.month}
            options={monthOptions}
            onChange={(value) => setFilter(prev => ({ ...prev, month: value }))}
            placeholder="Todos los Meses"
          />
          <CustomSelect
            value={filter.day}
            options={dayOptions}
            onChange={(value) => setFilter(prev => ({ ...prev, day: value }))}
            placeholder="Todos los Días"
          />
          <button 
            onClick={() => setFilter({ year: 'all', month: 'all', day: 'all' })}
            style={styles.clearFilterButton}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete_sweep</span>
            Limpiar
          </button>
          {/* Botón para imprimir reporte del dashboard */}
          <button 
            onClick={() => setShowDashboardReport(true)}
            style={{...styles.clearFilterButton, background: 'rgba(58, 123, 213, 0.3)', border: '1px solid rgba(58, 123, 213, 0.5)'}}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
            Imprimir Reporte
          </button>
        </div>
      </div>

      {/* Mensaje de filtros activos */}
      { (filter.year !== 'all' || filter.month !== 'all' || filter.day !== 'all') &&
        <div style={styles.activeFilterMessage}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_alt</span>
          Mostrando resultados para: 
          {filter.day !== 'all' && ` día ${filter.day}`}
          {filter.month !== 'all' && ` de ${monthOptions.find(m => m.value === filter.month)?.label}`}
          {filter.year !== 'all' && ` de ${filter.year}`}
        </div>
      }

      {/* Divisor */}
      <div style={{
        height: '1px',
        background: 'rgba(255, 255, 255, 0.2)',
        margin: '2rem 0'
      }}>
      </div>

      {/* Cards resumen */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        <StatCard
          icon={<span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '40px' }}>people</span>}
          title="Personas Registradas"
          value={summary.totalPersons}
          gradient="linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)"
          onClick={() => handleOpenModal("persons")}
        />
        <StatCard
          icon={<span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '40px' }}>gavel</span>}
          title="Arrestos Totales"
          value={summary.totalArrests}
          gradient="linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
          onClick={() => handleOpenModal("arrests")}
        />
        <StatCard
          icon={<span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '40px' }}>warning</span>}
          title="Delito Más Común"
          value={summary.topOffenses[0]?.offense || "N/A"}
          subtitle={summary.topOffenses[0] ? `${summary.topOffenses[0].count} casos` : ""}
          gradient="linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)"
          onClick={() => handleOpenModal("offenses")}
        />
        <StatCard
          icon={<span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '40px' }}>crown</span>}
          title="Persona con Más Arrestos"
          value={summary.topPersons[0]?.name || "N/A"}
          subtitle={summary.topPersons[0] ? `${summary.topPersons[0].count} arrestos` : ""}
          gradient="linear-gradient(135deg, #525252 0%, #3d72b4 100%)"
          onClick={() => handleOpenModal("top-persons")}
        />
      </div>

      {/* Sección: Generar Reporte */}
      <div style={{
        background: "rgba(10, 25, 41, 0.5)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "1.5rem 2rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        marginBottom: "2rem"
      }}>
        <h3 style={{ ...styles.chartTitle, marginBottom: '1.5rem' }}>
          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '24px' }}>description</span>
          Generar Reporte por Persona
        </h3>
        <form onSubmit={handleReportSearch} style={styles.reportSearchForm}>
          <input
            type="text"
            style={styles.reportSearchInput}
            placeholder="Buscar por nombre o apellido..."
            value={reportSearchTerm}
            onChange={(e) => setReportSearchTerm(e.target.value)}
          />
          <button type="submit" style={styles.reportSearchButton} disabled={isSearchingReport}>
            {isSearchingReport ? (
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>autorenew</span>
            ) : (
              <span className="material-symbols-outlined">search</span>
            )}
          </button>
        </form>

        {reportSearchResults.length > 0 && (
          <div style={styles.reportResultsContainer}>
            {reportSearchResults.map(person => (
              <div key={person.id} style={styles.reportResultItem}>
                <div style={styles.reportResultInfo}>
                  <img 
                    src={`http://localhost:5000/${person.photo_path}`} 
                    alt="foto" 
                    style={styles.reportResultPhoto} 
                  />
                  <div>
                    <span style={styles.reportResultName}>{person.first_name} {person.last_name}</span>
                    <span style={styles.reportResultId}>ID: {person.id_number || 'N/A'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => window.open(`http://localhost:5000/api/dashboard/privacy-notice/${person.id}`, '_blank')}
                    style={{
                      ...styles.generateReportButton,
                      background: '#667eea',
                    }}
                    title="Generar Aviso de Privacidad"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shield_person</span>
                    Aviso
                  </button>
                  <button
                    onClick={() => handleGenerateReport(person.id)}
                    style={styles.generateReportButton}
                    title="Generar Informe de Persona"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
                    Informe
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "2rem",
        marginBottom: "2rem"
      }}>
        <ChartCard title="Distribución de Delitos">
          <Pie
            data={{
              labels: summary.topOffenses.map((o) => o.offense),
              datasets: [{
                data: summary.topOffenses.map((o) => o.count),
                backgroundColor: [
                  "#007bff",
                  "#1e3c72",
                  "#3a7bd5",
                  "#4e8cff",
                  "#2a5298",
                  "#00d2ff"
                ],
                borderWidth: 0,
              }]
            }}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { color: "#fff", padding: 15, font: { size: 12 } }
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard title="Top 5 Personas con Más Arrestos">
          <Bar
            data={{
              labels: summary.topPersons.map((p) => p.name),
              datasets: [{
                label: "Arrestos",
                data: summary.topPersons.map((p) => p.count),
                backgroundColor: "rgba(58, 123, 213, 0.8)",
                borderColor: "#3a7bd5",
                borderWidth: 2,
                borderRadius: 8,
              }]
            }}
            options={{
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { color: "#fff" },
                  grid: { color: "rgba(255,255,255,0.1)" }
                },
                x: {
                  ticks: { color: "#fff", font: { size: 11 } },
                  grid: { display: false }
                }
              }
            }}
          />
        </ChartCard>
      </div>

      {/* Tabla de arrestos recientes */}
      <div style={{
        background: "rgba(10, 25, 41, 0.5)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{
          color: "#fff",
          fontSize: "1.5rem",
          marginBottom: "1.5rem",
          fontWeight: "600"
        }}>
          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '40px' }}>schedule</span>
          Arrestos Recientes
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0"
          }}>
            <thead>
                <tr>
                  <th style={thStyle}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px', color: '#fff' }}>
                    calendar_today
                  </span>
                  Fecha
                </th>
                <th style={thStyle}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px', color: '#fff' }}>
                    people
                  </span>
                  Persona
                </th>
                <th style={thStyle}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px', color: '#fff' }}>
                    warning
                  </span>
                  Delito
                </th>
                <th style={thStyle}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px', color: '#fff' }}>
                    place
                  </span>
                  Lugar
                </th>
                <th style={thStyle}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px', color: '#fff' }}>
                    local_police
                  </span>
                  Oficial
                </th>
                <th style={thStyle}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px', color: '#fff' }}>
                    attach_money
                  </span>
                  Fianza
                </th>
              </tr>
            </thead>
            <tbody>
              {arrests.map((a, idx) => (
                <tr key={idx} style={{
                  background: idx % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}
                >
                  <td style={tdStyle}>{new Date(a.arrest_date).toLocaleDateString()}</td>
                  <td style={tdStyle}>{a.person_name}</td>
                  <td style={tdStyle}>
                    <span style={{
                      background: "rgba(211, 47, 47, 0.3)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: "500"
                    }}>
                      {a.offense}
                    </span>
                  </td>
                  <td style={tdStyle}>{a.location}</td>
                  <td style={tdStyle}>{a.arresting_officer || "N/A"}</td>
                  <td style={tdStyle}>
                    <span style={{
                      background: "rgba(58, 123, 213, 0.3)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: "500"
                    }}>
                      {a.bail_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalData.isOpen && (
        <DashboardModal
          title={modalData.title}
          data={modalData.data}
          renderItem={modalData.renderItem}
          onClose={() => setModalData({ ...modalData, isOpen: false })}
        />
      )}
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, gradient, onClick }) {
  return (
    <div style={{
      background: gradient,
      borderRadius: "16px",
      padding: "1.5rem",
      color: "#fff",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      transition: "transform 0.2s",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{
          background: "rgba(255,255,255,0.2)",
          padding: "0.75rem",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem"
        }}>
          {icon}
        </div>
        <h4 style={{
          fontSize: "0.9rem",
          fontWeight: "500",
          opacity: 0.9,
          margin: 0
        }}>
          {title}
        </h4>
      </div>
      <p style={{
        fontSize: "2rem",
        fontWeight: "700",
        margin: "0.5rem 0",
        wordBreak: "break-word"
      }}>
        {value}
      </p>
      {subtitle && (
        <p style={{
          fontSize: "0.85rem",
          opacity: 0.8,
          margin: 0
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: "rgba(10, 25, 41, 0.5)",
      backdropFilter: "blur(10px)",
      borderRadius: "16px",
      padding: "1.5rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
    }}>
      <h3 style={{
        color: "#fff",
        fontSize: "1.25rem",
        marginBottom: "1.5rem",
        fontWeight: "600"
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem'
  },

  iconContainer: {
    background: 'linear-gradient(135deg, #871195ff 0%, #f5576c 100%)',
    padding: '1rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
  },

  icon: {
    fontSize: '2rem'
  },

  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },

  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: '0.25rem 0 0 0'
  },
  reportSearchForm: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  reportSearchInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
  },
  reportSearchButton: {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportResultsContainer: {
    maxHeight: '300px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    paddingRight: '10px',
  },
  reportResultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '0.75rem',
    borderRadius: '8px',
  },
  reportResultInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  reportResultPhoto: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  reportResultName: {
    fontWeight: '600',
    color: '#fff',
    display: 'block',
  },
  reportResultId: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  generateReportButton: {
    padding: '8px 12px',
    background: '#3a7bd5',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  chartTitle: {
    color: "#fff",
    fontSize: "1.25rem",
    marginBottom: "1.5rem",
    fontWeight: "600"
  },
  filterContainer: {
    background: "rgba(10, 25, 41, 0.5)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "1.5rem 2rem",
    marginBottom: "1rem",
  },
  filterTitle: {
    color: "#fff",
    fontSize: "1.2rem",
    margin: "0 0 1rem 0",
    fontWeight: "600",
  },
  filterControls: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  clearFilterButton: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(211, 47, 47, 0.3)',
    border: '1px solid rgba(211, 47, 47, 0.5)',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  activeFilterMessage: {
    background: 'rgba(58, 123, 213, 0.2)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    textAlign: 'center',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }
};

const thStyle = {
  padding: "1rem",
  textAlign: "left",
  color: "#fff",
  fontWeight: "600",
  fontSize: "0.9rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "2px solid rgba(255,255,255,0.2)"
};

const tdStyle = {
  padding: "1rem",
  color: "#fff",
  fontSize: "0.95rem"

};