import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

export default function Dashboard({ onMessage }) {
  const [summary, setSummary] = useState({
    totalPersons: 0,
    totalArrests: 0,
    topOffenses: [],
    topPersons: []
  });
  const [arrests, setArrests] = useState([]);

  const fetchDashboard = async () => {
    try {
      const statsRes = await fetch("http://localhost:5000/api/dashboard/stats");
      const statsData = await statsRes.json();

      const recentRes = await fetch("http://localhost:5000/api/dashboard/recent-arrests");
      const recentData = await recentRes.json();

      const recentArrests = recentData.recentArrests.map(a => ({
        ...a,
        person_name: `${a.first_name || ""} ${a.alias ? `"${a.alias}" ` : ""}${a.last_name || ""}`.trim(),
        offense: a.falta_administrativa || "Sin especificar",
        location: a.comunidad || "N/A",
        bail_status: a.fianza !== undefined ? a.fianza : "N/A"
      }));

      setSummary({
        totalPersons: statsData.totalPersons,
        totalArrests: statsData.totalArrests,
        topOffenses: statsData.topOffenses,
        topPersons: statsData.topPersons || []
      });

      setArrests(recentArrests);
    } catch (err) {
      console.error(err);
      if (onMessage) onMessage({ type: "error", text: "Error al cargar dashboard" });
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div style={{
      padding: "2rem",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        marginBottom: "2rem",
        textAlign: "center"
      }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          color: "#fff",
          marginBottom: "0.5rem",
          textShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}>
        <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '60px' }}>dashboard_2</span>
          Dashboard de Monitoreo
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: "1rem"
        }}>
          Sistema de seguimiento y análisis en tiempo real
        </p>
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
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          icon={<span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '40px' }}>gavel</span>}
          title="Arrestos Totales"
          value={summary.totalArrests}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          icon={<span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '40px' }}>warning</span>}
          title="Delito Más Común"
          value={summary.topOffenses[0]?.offense || "N/A"}
          subtitle={summary.topOffenses[0] ? `${summary.topOffenses[0].count} casos` : ""}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCard
          icon={<span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', fontSize: '40px' }}>crown</span>}
          title="Persona con Más Arrestos"
          value={summary.topPersons[0]?.name || "N/A"}
          subtitle={summary.topPersons[0] ? `${summary.topPersons[0].count} arrestos` : ""}
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        />
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
              labels: summary.topOffenses.map(o => o.offense),
              datasets: [{
                data: summary.topOffenses.map(o => o.count),
                backgroundColor: [
                  "#667eea",
                  "#764ba2",
                  "#f093fb",
                  "#f5576c",
                  "#4facfe",
                  "#00f2fe"
                ],
                borderWidth: 0
              }]
            }}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { color: "#fff", padding: 15, font: { size: 12 } }
                }
              }
            }}
          />
        </ChartCard>

        <ChartCard title="Top 5 Personas con Más Arrestos">
          <Bar
            data={{
              labels: summary.topPersons.map(p => p.name),
              datasets: [{
                label: "Arrestos",
                data: summary.topPersons.map(p => p.count),
                backgroundColor: "rgba(102, 126, 234, 0.8)",
                borderColor: "#667eea",
                borderWidth: 2,
                borderRadius: 8
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
        background: "rgba(255,255,255,0.1)",
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
                      background: "rgba(245, 87, 108, 0.2)",
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
                      background: "rgba(102, 126, 234, 0.2)",
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
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, gradient }) {
  return (
    <div style={{
      background: gradient,
      borderRadius: "16px",
      padding: "1.5rem",
      color: "#fff",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      transition: "transform 0.2s",
      cursor: "pointer"
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
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
      background: "rgba(255,255,255,0.1)",
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
