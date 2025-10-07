import React, { useState } from 'react';
import axios from 'axios';

const SearchPeople = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await axios.get('http://localhost:5000/api/search_face/by_name', {
        params: {
          first_name: firstName,
          last_name: lastName,
        },
      });
      setResults(res.data.results);
    } catch (err) {
      setError('Error al buscar personas');
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <h2>Buscar Persona por Nombre</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {results.map((person) => (
          <li
            key={person.id}
            style={{
              marginBottom: "2rem",
              border: "1px solid #ccc",
              borderRadius: "12px",
              background: "#1e1e2f",
              color: "#fff",
              padding: "1.5rem",
              boxShadow: "0px 4px 15px rgba(0,0,0,0.5)",
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
              flexWrap: "wrap"
            }}
          >
            {person.photo_path && (
              <img
                src={`http://localhost:5000/uploads/photos/${person.photo_path.split("\\").pop()}`}
                alt="Foto"
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "2px solid #4caf50",
                }}
              />
            )}
            <div style={{ flex: "1 1 400px" }}>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
                {person.first_name} {person.last_name}{" "}
                {person.alias && `(${person.alias})`}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <div><strong>Fecha de Nac.:</strong> {formatDate(person.dob)}</div>
                <div><strong>Género:</strong> {person.gender || "N/A"}</div>
                <div><strong>Nacionalidad:</strong> {person.nationality || "N/A"}</div>
                <div><strong>Estado:</strong> {person.state || "N/A"}</div>
                <div><strong>Municipio:</strong> {person.municipality || "N/A"}</div>
                <div><strong>Comunidad:</strong> {person.community || "N/A"}</div>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <p><strong>ID:</strong> {person.id_number || "N/A"}</p>
                <p><strong>Notas:</strong> {person.observaciones || "Sin notas"}</p>
                <p><strong>Creado:</strong> {formatDate(person.created_at)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {results.length === 0 && !loading && <p>No se encontraron resultados.</p>}
    </div>
  );
};

export default SearchPeople;