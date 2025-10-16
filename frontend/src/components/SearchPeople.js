import React, { useState } from 'react';
import axios from 'axios';
import ArrestModal from './ArrestModal';
import HistoryArrestModal from './HistoryArrestModal';

const SearchPeople = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // <-- Nuevo estado
  const [showArrestModal, setShowArrestModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setHasSearched(true); // <-- Indicamos que se hizo búsqueda

    if (!firstName && !lastName) {
      setError('Ingresa un nombre o apellido para buscar');
      setLoading(false);
      return;
    }

    setLoading(true);
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

  const handleOpenArrestModal = (person) => {
    setSelectedPerson(person);
    setShowArrestModal(true);
  };

  const handleOpenHistoryModal = (person) => {
    setSelectedPerson(person);
    setShowHistoryModal(true);
  };

  const handleCloseArrestModal = () => {
    setShowArrestModal(false);
    setSelectedPerson(null);
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedPerson(null);
  };

  const handleSaveArrest = async (arrestData) => {
    if (!selectedPerson) return;
    try {
      await axios.post('http://localhost:5000/api/arrests', {
        person_id: selectedPerson.id,
        ...arrestData,
      });
      setShowArrestModal(false);
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      alert('Error al registrar arresto');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header de búsqueda */}
      <div style={styles.searchHeader}>
        <div style={styles.iconContainer}>
          <span className="material-symbols-outlined">search</span>
        </div>
        <div>
          <h2 style={styles.title}>Buscar Persona</h2>
          <p style={styles.subtitle}>Ingresa el nombre o apellido para buscar en la base de datos</p>
        </div>
      </div>

      {/* Formulario de búsqueda */}
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <div style={styles.inputGroup}>
          <div style={styles.inputWrapper}>
            <span className='material-symbols-outlined' style={{ ...styles.inputIcon, color: '#000000ff' }}>person</span>
            <input
              type="text"
              placeholder="Nombre(s)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputWrapper}>
            <span className='material-symbols-outlined' style={{ ...styles.inputIcon, color: '#000000ff' }}>badge</span>
            <input
              type="text"
              placeholder="Apellido(s)"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={styles.input}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.searchButton,
              ...(loading ? styles.searchButtonDisabled : {})
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
          >
            <span className='material-symbols-outlined' style={styles.buttonIcon}>search</span>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div style={styles.errorMessage}>
          <span className='material-symbols-outlined' style={styles.errorIcon}>error</span>
          {error}
        </div>
      )}

      {/* Resultados */}
      <div style={styles.resultsContainer}>
        {results.length > 0 && (
          <div style={styles.resultsHeader}>
            <span style={styles.resultsCount}>
              {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </span>
          </div>
        )}

        {results.map((person) => (
          <div key={person.id} style={styles.personCard}>
            {/* Foto */}
            {person.photo_path && (
              <div style={styles.photoContainer}>
                <img
                  src={`http://localhost:5000/${person.photo_path}`}
                  alt="Foto"
                  style={styles.photo}
                />
              </div>
            )}

            {/* Información */}
            <div style={styles.personInfo}>
              <h3 style={styles.personName}>
                {person.full_name || `${person.first_name} ${person.last_name}`}
                {person.alias && <span style={styles.alias}> "{person.alias}"</span>}
              </h3>

              {/* Información personal */}
              <div style={styles.infoGrid}>
                <InfoItem
                icon={
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', verticalAlign: 'middle' }}>
                    calendar_today
                  </span>
                }
                label="Fecha de Nac."
                value={formatDate(person.dob)}
              />

                <InfoItem icon={
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', verticalAlign: 'middle' }}>
                    transgender
                  </span>
                } label="Género" value={person.gender || "N/A"} />
                <InfoItem icon={
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', verticalAlign: 'middle' }}>
                    globe
                  </span>
                } label="Nacionalidad" value={person.nationality || "N/A"} />
                <InfoItem icon={
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', verticalAlign: 'middle' }}>
                    location_on
                  </span>
                } label="Estado" value={person.state || "N/A"} />
                <InfoItem icon={
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', verticalAlign: 'middle' }}>
                    location_city
                  </span>
                } label="Municipio" value={person.municipality || "N/A"} />
                <InfoItem icon={
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', verticalAlign: 'middle' }}>
                    home
                  </span>
                } label="Comunidad" value={person.community || "N/A"} />
              </div>

              {/* Información adicional */}
              <div style={styles.additionalInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                    id_card
                  </span>
                  ID:
                </span>
                  <span style={styles.infoValue}>{person.id_number || "N/A"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                      edit_note
                    </span>
                    Observaciones:
                  </span>
                  <span style={styles.infoValue}>{person.observaciones || "Sin notas"}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                      access_time
                    </span>
                    Registrado:
                  </span>
                  <span style={styles.infoValue}>{formatDate(person.created_at)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div style={styles.actionButtons}>
                <button
                  onClick={() => handleOpenArrestModal(person)}
                  style={styles.arrestButton}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <span style={styles.buttonIcon}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '20px' }}>add</span>
                  </span>
                  Nuevo Arresto
                </button>
                <button
                  onClick={() => handleOpenHistoryModal(person)}
                  style={styles.historyButton}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <span style={styles.buttonIcon}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '20px' }}>overview</span>
                  </span>
                  Ver Historial
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Mostrar "No se encontraron resultados" solo después de hacer la búsqueda */}
        {hasSearched && results.length === 0 && !loading && !error && (
          <div style={styles.noResults}>
            <span style={styles.noResultsIcon}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '24px' }}>search</span>
            </span>
            <p style={styles.noResultsText}>No se encontraron resultados</p>
            <p style={styles.noResultsSubtext}>Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modales */}
      {showArrestModal && selectedPerson && (
        <ArrestModal
          person={selectedPerson}
          onClose={handleCloseArrestModal}
          onSave={handleSaveArrest}
        />
      )}
      {showHistoryModal && selectedPerson && (
        <HistoryArrestModal
          open={showHistoryModal}
          onClose={handleCloseHistoryModal}
          arrests={selectedPerson.arrests || []}
          person={selectedPerson}
        />
      )}
    </div>
  );
};

// Componente auxiliar para items de información
const InfoItem = ({ icon, label, value }) => (
  <div style={styles.infoItem}>
    <span style={styles.itemIcon}>{icon}</span>
    <div>
      <div style={styles.itemLabel}>{label}</div>
      <div style={styles.itemValue}>{value}</div>
    </div>
  </div>
);

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#fff'
  },

  searchHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem'
  },

  iconContainer: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },

  icon: {
    fontSize: '2rem'
  },

  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: 0,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },

  subtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: '0.25rem 0 0 0'
  },

  searchForm: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  },

  inputGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    alignItems: 'end'
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  inputIcon: {
    position: 'absolute',
    left: '1rem',
    fontSize: '1.2rem',
    pointerEvents: 'none',
    zIndex: 1
  },

  input: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 3rem',
    fontSize: '0.95rem',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#333',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  },

  searchButton: {
    background: 'linear-gradient(135deg, #4facfe 0%, #2ea3a9ff 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
    transition: 'all 0.3s ease',
    outline: 'none',
    whiteSpace: 'nowrap'
  },

  searchButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },

  buttonIcon: {
    fontSize: '1.1rem'
  },

  errorMessage: {
    background: 'rgba(245, 87, 108, 0.2)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid rgba(245, 87, 108, 0.3)'
  },

  errorIcon: {
    fontSize: '1.2rem'
  },

  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },

  resultsHeader: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    textAlign: 'center'
  },

  resultsCount: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)'
  },

  personCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    transition: 'all 0.3s ease'
  },

  photoContainer: {
    flexShrink: 0
  },

  photo: {
    width: '150px',
    height: '150px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '3px solid rgba(102, 126, 234, 0.5)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
  },

  personInfo: {
    flex: '1 1 400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  personName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0,
    color: '#fff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },

  alias: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    fontSize: '1.2rem'
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem'
  },

  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px'
  },

  itemIcon: {
    fontSize: '1.2rem'
  },

  itemLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500'
  },

  itemValue: {
    fontSize: '0.9rem',
    color: '#fff',
    fontWeight: '600'
  },

  additionalInfo: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '1rem',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  infoRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'baseline'
  },

  infoLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    minWidth: '140px'
  },

  infoValue: {
    fontSize: '0.9rem',
    color: '#fff'
  },

  actionButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },

  arrestButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
    transition: 'all 0.3s ease',
    outline: 'none'
  },

  historyButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    outline: 'none'
  },

  noResults: {
    textAlign: 'center',
    padding: '3rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    border: '2px dashed rgba(255, 255, 255, 0.2)'
  },

  noResultsIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    display: 'block',
    opacity: 0.5
  },

  noResultsText: {
    fontSize: '1.2rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    color: 'rgba(255, 255, 255, 0.9)'
  },

  noResultsSubtext: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0
  }
};

export default SearchPeople;