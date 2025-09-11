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
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center"> Estadísticas de Registro</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default Dashboard;
