// src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import FacialSearch from "./FacialSearch";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

export default function Dashboard({ onMessage }) {
  const [summary, setSummary] = useState({
    totalPersons: 0,
    totalArrests: 0,
    topDelitos: [],
    topPersons: []
  });
  const [arrests, setArrests] = useState([]);

  // Obtener datos del dashboard desde backend
  const fetchDashboard = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        setArrests(data.recentArrests);
      } else {
        onMessage({ type: "error", text: data.error || "Error al cargar dashboard" });
      }
    } catch (err) {
      console.error(err);
      onMessage({ type: "error", text: "Error al cargar dashboard" });
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
        <Card title="Delitos Más Comunes" value={summary.topDelitos.join(", ")} color="#f44336" />
        <Card title="Personas con Más Arrestos" value={summary.topPersons.join(", ")} color="#ff9800" />
      </div>

      {/* Gráficos */}
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px", background: "#2a2a3d", padding: "1rem", borderRadius: "12px" }}>
          <h3>Arrestos por Delito</h3>
          <Pie
            data={{
              labels: summary.topDelitos,
              datasets: [
                {
                  data: summary.topDelitos.map(d => Math.floor(Math.random() * 10) + 1), // ejemplo, reemplazar con backend
                  backgroundColor: ["#4caf50", "#2196f3", "#f44336", "#ff9800"]
                }
              ]
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: "300px", background: "#2a2a3d", padding: "1rem", borderRadius: "12px" }}>
          <h3>Arrestos por Persona</h3>
          <Bar
            data={{
              labels: summary.topPersons,
              datasets: [
                {
                  label: "Cantidad de arrestos",
                  data: summary.topPersons.map(() => Math.floor(Math.random() * 5) + 1),
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
                <td style={tdStyle}>{a.arresting_officer}</td>
                <td style={tdStyle}>{a.bail_status ? "Permitida" : "Denegada"}</td>
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
