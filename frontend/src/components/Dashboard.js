import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

export default function Dashboard({ onMessage }) {
  const [summary, setSummary] = useState({
    totalPersons: 0,
    totalArrests: 0,
    topOffenses: [], // [{ falta_administrativa: "Robo", count: 5 }]
    topPersons: []   // [{ name: "Juan Perez", count: 3 }]
  });
  const [arrests, setArrests] = useState([]);

  // Obtener datos del dashboard desde backend
  const fetchDashboard = async () => {
    try {
      const statsRes = await fetch("http://localhost:5000/api/dashboard/stats");
      const statsData = await statsRes.json();

      const recentRes = await fetch("http://localhost:5000/api/dashboard/recent-arrests");
      const recentData = await recentRes.json();

      // Mapear nombre completo de cada persona en arrestos recientes
      const recentArrests = recentData.recentArrests.map(a => ({
        ...a,
        person_name: `${a.first_name || ""} ${a.middle_name || ""} ${a.last_name || ""}`.trim(),
        offense: a.falta_administrativa || "N/A",
        location: a.comunidad || "N/A",
        bail_status: a.fianza !== undefined ? a.fianza : "N/A"
      }));

      setSummary({
        totalPersons: statsData.totalPersons,
        totalArrests: statsData.totalArrests,
        topOffenses: statsData.topOffenses, // [{ falta_administrativa, count }]
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
    <div style={{ padding: "2rem", background: "#1e1e2f", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Dashboard de Monitoreo</h1>

      {/* Cards resumen */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <Card title="Personas Registradas" value={summary.totalPersons} color="#4caf50" />
        <Card title="Arrestos Registrados" value={summary.totalArrests} color="#2196f3" />
        <Card title="Delitos Más Comunes" value={summary.topOffenses.map(o => o.falta_administrativa).join(", ")} color="#f44336" />
        <Card title="Personas con Más Arrestos" value={summary.topPersons.map(p => p.name).join(", ")} color="#ff9800" />
      </div>

      {/* Gráficos */}
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px", background: "#2a2a3d", padding: "1rem", borderRadius: "12px" }}>
          <h3>Arrestos por Delito</h3>
          <Pie
            data={{
              labels: summary.topOffenses.map(o => o.falta_administrativa),
              datasets: [
                {
                  data: summary.topOffenses.map(o => o.count),
                  backgroundColor: ["#4caf50", "#2196f3", "#f44336", "#ff9800", "#9c27b0", "#ff5722"]
                }
              ]
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: "300px", background: "#2a2a3d", padding: "1rem", borderRadius: "12px" }}>
          <h3>Arrestos por Persona</h3>
          <Bar
            data={{
              labels: summary.topPersons.map(p => p.name),
              datasets: [
                {
                  label: "Cantidad de arrestos",
                  data: summary.topPersons.map(p => p.count),
                  backgroundColor: "#2196f3"
                }
              ]
            }}
          />
        </div>
      </div>

      {/* Tabla de arrestos recientes */}
      <div style={{ marginBottom: "2rem" }}>
        <h3>Arrestos Recientes</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#2a2a3d" }}>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Persona</th>
              <th style={thStyle}>Delito</th>
              <th style={thStyle}>Lugar</th>
              <th style={thStyle}>Oficial</th>
              <th style={thStyle}>Fianza</th>
            </tr>
          </thead>
          <tbody>
            {arrests.map((a, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "#1e1e2f" : "#252537" }}>
                <td style={tdStyle}>{new Date(a.arrest_date).toLocaleDateString()}</td>
                <td style={tdStyle}>{a.person_name}</td>
                <td style={tdStyle}>{a.offense}</td>
                <td style={tdStyle}>{a.location}</td>
                <td style={tdStyle}>{a.arresting_officer || "N/A"}</td>
                <td style={tdStyle}>{a.bail_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Card component
function Card({ title, value, color }) {
  return (
    <div style={{
      flex: 1,
      minWidth: "200px",
      background: color,
      borderRadius: "12px",
      padding: "1rem",
      color: "#fff",
      textAlign: "center",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.3)"
    }}>
      <h4>{title}</h4>
      <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}

const thStyle = { padding: "0.5rem", textAlign: "left" };
const tdStyle = { padding: "0.5rem" };
