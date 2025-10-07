import React, { useState } from "react";

const SearchPeople = ({ onMessage }) => {
  const [filterBy, setFilterBy] = useState("nombre");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!searchTerm.trim()) {
      onMessage({ type: "error", text: "Ingresa un término de búsqueda" });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const res = await fetch(
        `http://localhost:5000/api/search_persons?filterBy=${filterBy}&term=${encodeURIComponent(searchTerm)}`
      );

      // Evitar error si la respuesta no es JSON
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta inválida del servidor");
      }

      if (!res.ok) {
        throw new Error(data.error || "Error en la búsqueda");
      }

      setResults(data);

      if (data.length === 0) {
        onMessage({ type: "error", text: "No se encontraron resultados" });
      }
    } catch (err) {
      console.error("Error al buscar personas:", err);
      onMessage({ type: "error", text: err.message || "Error al buscar personas" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Búsqueda de Personas</h2>

      <form
        onSubmit={handleSearch}
        style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}
      >
        <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
          <option value="nombre">Nombre</option>
          <option value="comunidad">Comunidad</option>
          <option value="folio">Folio</option>
        </select>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ingrese término de búsqueda"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#9580ff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {results.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#eee" }}>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>ID</th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Nombre</th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Alias</th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Comunidad</th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Folio</th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {results.map((p) => (
              <tr key={p.id}>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{p.id}</td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {p.first_name} {p.last_name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {p.alias || "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {p.community || "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {p.folio || "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  {p.observaciones || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SearchPeople;
