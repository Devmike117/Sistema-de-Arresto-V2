import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';

function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    axios.get('/api/stats') // Ajusta la URL según tu backend
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error al obtener estadísticas:', error);
      });
  }, []);

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: 'Registros',
        data: data.values || [],
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
      },
    ],
  };

  return (
    <div>
      <h3>Estadísticas de Registro</h3>
      <Bar data={chartData} />
    </div>
  );
}

export default Dashboard;
