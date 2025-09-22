import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState({});
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('/api/stats')
      .then(response => setData(response.data))
      .catch(error => console.error('Error al obtener estadísticas:', error));

    axios.get('/api/records') // Endpoint para registros biométricos
      .then(response => setRecords(response.data))
      .catch(error => console.error('Error al obtener registros:', error));
  }, []);

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: 'Registros',
        data: data.values || [],
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
        borderRadius: 4,
        barThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#374151',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: '#6b7280' }, grid: { display: false } },
      y: { ticks: { color: '#6b7280' }, grid: { color: '#e5e7eb' } },
    },
  };

  const filteredRecords = records.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    window.print(); // Simple export vía impresión
  };

  return (
    <div className="dashboard-container">
  <h3 className="text-dashboard">Dashboard de Registros</h3>

  {/* Estadísticas */}
  <div className="bg-gray-50 p-4 rounded-lg mb-8 shadow-md">
    <Bar data={chartData} options={chartOptions} />
  </div>

  {/* Filtros */}
  <div className="filter-section">
    <div className="filter">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-input"
      />
      </div>

    <div className="filter">
      <button
        onClick={handleExport}
        className="export-import-btn"
      >
        Exportar / Imprimir
      </button>
    </div>
  </div>


      {/* Tabla de registros */}
      <div className="table-container">
        <table className="table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-right">Nombre</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Foto</th>
              <th className="px-4 py-2 text-left">Huella</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{record.name}</td>
                <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <img src={record.photoUrl} alt="Foto" className="w-16 h-16 object-cover rounded" />
                </td>
                <td className="px-4 py-2">
                  <img src={record.fingerprintUrl} alt="Huella" className="w-16 h-16 object-cover rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
