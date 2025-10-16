import React, { useState, useRef, useEffect } from 'react';
import {
  faltasAdministrativas,
  comunidadesArresto,
  turnos,
  oficialesPrimerTurno,
  oficialesSegundoTurno
} from '../data/constants';


export default function RegisterForm({ onNext, onMessage }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [firma, setFirma] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPDF, setShowPDF] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    alias: '',
    last_name: '',
    dob: '',
    gender: '',
    nationality: 'Mexicana',
    state: '',
    municipality: '',
    community: '',
    id_number: '',
    observaciones: '',
    falta_administrativa: '',
    falta_administrativa_otro: '',
    arrest_community: '',
    arresting_officer: '',
    turno: '',
    folio: '',
    rnd: '',
    sentencia: ''
  });

  const [mexicoData, setMexicoData] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [oficiales, setOficiales] = useState([]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/Devmike117/DB-Mexico-JSON/master/M%C3%A9xico.json')
      .then(res => res.json())
      .then(data => {
        const estadosSimplificados = data.map(e => ({
          ...e,
          nombre: e.nombre.split(' de ')[0]
        }));
        setMexicoData(estadosSimplificados);
      })
      .catch(err => console.error('Error al cargar México.json:', err));
  }, []);

 // Manejo optimizado de dibujo en canvas
const startDrawing = (e) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const { x, y } = getRelativeCoords(e, canvas);

  ctx.beginPath();
  ctx.moveTo(x, y);
  setIsDrawing(true);
};

const draw = (e) => {
  if (!isDrawing) return;

  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const { x, y } = getRelativeCoords(e, canvas);

  ctx.lineTo(x, y);
  ctx.stroke();
};

const stopDrawing = () => {
  if (!canvasRef.current) return;

  const ctx = canvasRef.current.getContext('2d');
  ctx.closePath();
  setIsDrawing(false);
};

const getRelativeCoords = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();

  // manejo de escalas para firma correcta
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
};

  const guardarFirma = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      setFirma(dataURL);
    }
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFirma(null);
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'state') {
      const estado = mexicoData.find(e => e.nombre === value);
      setMunicipios(estado?.municipios || []);
      setForm(prev => ({ ...prev, municipality: '', community: '' }));
      setLocalidades([]);
    }

    if (name === 'municipality') {
      const municipio = municipios.find(m => m.nombre === value);
      setLocalidades(municipio?.localidades || []);
      setForm(prev => ({ ...prev, community: '' }));
    }

    if (name === 'turno') {
      if (value === "Primer Turno") setOficiales(oficialesPrimerTurno);
      else if (value === "Segundo Turno") setOficiales(oficialesSegundoTurno);
      else setOficiales([]);
      setForm(prev => ({ ...prev, arresting_officer: '' }));
    }
  }

  function handleSave(e) {
    e.preventDefault();

    const falta = form.falta_administrativa === "Otro"
      ? form.falta_administrativa_otro
      : form.falta_administrativa;

    if (!form.first_name || !form.last_name || !falta) {
      if (onMessage) onMessage({ type: 'error', text: 'Completa nombre, apellido y falta administrativa.' });
      return;
    }

    if (!acceptedTerms) {
      if (onMessage) onMessage({ type: 'error', text: 'Debes aceptar los términos de privacidad.' });
      return;
    }

    if (!firma) {
      if (onMessage) onMessage({ type: 'error', text: 'Por favor, firma antes de continuar.' });
      return;
    }

    const formData = { ...form, firma };
    if (onNext) onNext(formData);
    if (onMessage) onMessage({ type: 'success', text: 'Datos personales guardados, ahora captura foto y huellas.' });
  }

  function handleReset() {
    setForm({
      first_name: '',
      alias: '',
      last_name: '',
      dob: '',
      gender: '',
      nationality: 'Mexicana',
      state: '',
      municipality: '',
      community: '',
      id_number: '',
      observaciones: '',
      falta_administrativa: '',
      falta_administrativa_otro: '',
      arrest_community: '',
      arresting_officer: '',
      turno: '',
      folio: '',
      rnd: '',
      sentencia: ''
    });
    limpiarFirma();
    setAcceptedTerms(false);
    if (onMessage) onMessage(null);
  }

  const createInputStyle = (inputName) => ({
    ...styles.input,
    ...(focusedInput === inputName ? styles.inputFocus : {}),
  });

  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3b7215 0%, #2a529839 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={styles.formContainer}>
        
        {/* ===== HEADER CON ÍCONO ===== */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#fff' }}>person_add</span>
          </div>
          <div>
            <h3 style={styles.title}>Registro de Persona</h3>
            <p style={styles.subtitle}>
              Ingresa los datos personales y biométricos del arrestado
            </p>
          </div>
        </div>

        {/* ===== DATOS PERSONALES ===== */}
        <div>
          <div style={styles.sectionDivider}>
            <span style={styles.sectionLabel}>Datos de la persona</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombres *</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                onFocus={() => setFocusedInput('first_name')}
                onBlur={() => setFocusedInput(null)}
                style={createInputStyle('first_name')}
                placeholder="Ej: Juan"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Apellidos *</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                onFocus={() => setFocusedInput('last_name')}
                onBlur={() => setFocusedInput(null)}
                style={createInputStyle('last_name')}
                placeholder="Ej: García Pérez"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Alias</label>
              <input
                name="alias"
                value={form.alias}
                onChange={handleChange}
                onFocus={() => setFocusedInput('alias')}
                onBlur={() => setFocusedInput(null)}
                style={createInputStyle('alias')}
                placeholder="Ej: El Chaparro"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha de nacimiento</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Género</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Selecciona Género</option>
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Otro</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nacionalidad</label>
              <select
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                style={styles.input}
              >
                <option>Mexicana</option>
                <option>Extranjera</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Estado</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Selecciona un estado</option>
                {mexicoData.map((e, i) => <option key={i} value={e.nombre}>{e.nombre}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Municipio</label>
              <select
                name="municipality"
                value={form.municipality}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Selecciona un municipio</option>
                {municipios.map((m, i) => <option key={i} value={m.nombre}>{m.nombre}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Comunidad</label>
              <select
                name="community"
                value={form.community}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Selecciona una comunidad</option>
                {localidades.map((l, i) => <option key={i} value={l.nombre}>{l.nombre}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>ID (INE / Pasaporte)</label>
              <input
                name="id_number"
                value={form.id_number}
                onChange={handleChange}
                onFocus={() => setFocusedInput('id_number')}
                onBlur={() => setFocusedInput(null)}
                style={createInputStyle('id_number')}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Observaciones "Señas Particulares"</label>
              <input
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                onFocus={() => setFocusedInput('observaciones')}
                onBlur={() => setFocusedInput(null)}
                style={createInputStyle('observaciones')}
              />
            </div>
          </div>
        </div>

        {/* ===== PDF DE PRIVACIDAD ===== */}
        <div style={styles.pdfContainer}>
          <div style={styles.pdfHeader}>
            <h2 style={styles.pdfTitle}>Acuerdo de Privacidad y Confidencialidad</h2>
            <p style={styles.pdfSubtitle}>Por favor, revisa el documento antes de continuar con la firma.</p>
          </div>

          <div style={styles.pdfControls}>
           <button
            onClick={() => setShowPDF(!showPDF)}
            style={{
              ...styles.baseButton,
              flex: '1',
              minWidth: '150px',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {showPDF ? 'close' : 'description'}
            </span>
            {showPDF ? 'Ocultar PDF' : 'Ver PDF'}
          </button>

            <a
              href="/pdf/aviso_privacidad.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...styles.secondaryButton,
                textDecoration: 'none',
                justifyContent: 'center',
                minWidth: '150px',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>download</span>
              <span>Descargar PDF</span>
            </a>
          </div>

          {showPDF && (
            <iframe
              src="/pdf/aviso_privacidad.pdf"
              title="Acuerdo de Privacidad"
              style={styles.pdfFrame}
            />
          )}

          <div style={styles.acceptanceBox}>
            <input
              type="checkbox"
              id="acceptPrivacy"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={styles.acceptanceCheckbox}
            />
            <label htmlFor="acceptPrivacy" style={styles.acceptanceLabel}>
              Acepto los términos de privacidad y confidencialidad
            </label>
          </div>
        </div>

        {/* ===== FIRMA DIGITAL ===== */}
        <div>
          <div style={styles.sectionDivider}>
            <span style={styles.sectionLabel}>Firma Digital</span>
          </div>

          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', marginTop: '1rem', marginBottom: '1rem' }}>
            Firma en el área inferior para confirmar que has leído y aceptado los términos.
          </p>

          <div style={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              width={700}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={styles.canvas}
            />
          </div>

          <div style={styles.instructionBox}>
            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '18px', marginRight: '6px' }}>lightbulb_2</span>
            Usa el mouse para firmar naturalmente en el cuadro blanco arriba
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={limpiarFirma}
              style={styles.secondaryButton}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>
            Reintentar Firma
            </button>
            <button
              type="button"
              onClick={guardarFirma}
              style={styles.baseButton}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
            Guardar Firma
            </button>
          </div>

          {firma && (
            <div style={styles.signaturePreview}>
              <p style={styles.signatureLabel}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '18px', marginRight: '6px' }}>check_circle</span>
                Firma guardada:</p>
              <img src={firma} alt="Firma digital" style={styles.signatureImg} />
            </div>
          )}
        </div>
        {/* ===== INFORMACIÓN DEL ARRESTO ===== */}
        <div>
          <div style={styles.sectionDivider}>
            <span style={styles.sectionLabel}>Información del arresto</span>
          </div>

          {/* Falta administrativa */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Falta administrativa *</label>
              <select
                name="falta_administrativa"
                value={form.falta_administrativa}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Selecciona una opción</option>
                {faltasAdministrativas.map(falta => (
                  <option key={falta} value={falta}>{falta}</option>
                ))}
              </select>
              {form.falta_administrativa === "Otro" && (
                <input
                  name="falta_administrativa_otro"
                  value={form.falta_administrativa_otro}
                  onChange={handleChange}
                  style={{ ...styles.input, marginTop: '0.5rem' }}
                  placeholder="Especifica la falta administrativa"
                />
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Comunidad del arresto</label>
              <select
                name="arrest_community"
                value={form.arrest_community}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Selecciona una comunidad</option>
                {comunidadesArresto.map(com => (
                  <option key={com} value={com}>{com}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Turno y oficial */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Turno *</label>
              <select
                name="turno"
                value={form.turno}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Selecciona un turno</option>
                {turnos.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Oficial *</label>
              <select
                name="arresting_officer"
                value={form.arresting_officer}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  opacity: !form.turno ? 0.5 : 1,
                  cursor: !form.turno ? 'not-allowed' : 'pointer'
                }}
                required
                disabled={!form.turno}
              >
                <option value="">Selecciona un oficial</option>
                {oficiales.map((o) => (
                  <option key={o.id} value={o.name}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Folio, RND, sentencia */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Folio</label>
              <input
                name="folio"
                value={form.folio}
                onChange={handleChange}
                onFocus={() => setFocusedInput('folio')}
                onBlur={() => setFocusedInput(null)}
                style={createInputStyle('folio')}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>RND</label>
              <input
                name="rnd"
                value={form.rnd}
                onChange={handleChange}
                onFocus={() => setFocusedInput('rnd')}
                onBlur={() => setFocusedInput(null)}
                style={createInputStyle('rnd')}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Sentencia</label>
              <input
                name="sentencia"
                value={form.sentencia}
                onChange={handleChange}
                onFocus={() => setFocusedInput('sentencia')}
                onBlur={() => setFocusedInput(null)}
                style={createInputStyle('sentencia')}
              />
            </div>
          </div>
        </div>

        {/* ===== BOTONES ===== */}
        <div style={styles.formActions}>
          <button
            type="button"
            onClick={handleReset}
            style={styles.secondaryButton}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>restart_alt</span>
            Limpiar
          </button>
          <button
            type="submit"
            onClick={handleSave}
            style={styles.baseButton}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
            Guardar y continuar
          </button>
        </div>
      </div>
    </div>
  );
}

{/* ===== ESTILOS ===== */}

const styles = {
  baseButton: {
    background: 'linear-gradient(135deg, #4facfe 0%, #2ea3a9ff 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
    transition: 'all 0.3s ease',
    outline: 'none',
    userSelect: 'none',
  },

  secondaryButton: {
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
    outline: 'none',
    userSelect: 'none',
  },

  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxSizing: 'border-box',
  },

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

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },

  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },

  input: {
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    outline: 'none',
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#333',
    fontFamily: 'inherit',
  },

  inputFocus: {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
    background: '#fff',
  },

  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },

  sectionDivider: {
    margin: '1.5rem 0 0rem 0',
    borderTop: '2px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
  },

  sectionLabel: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '0 1rem',
    position: 'relative',
    top: '-0.8em',
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    fontSize: '1.1rem',
    borderRadius: '8px',
  },

  pdfHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },

  pdfTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },

  pdfSubtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  pdfControls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },

  pdfFrame: {
    width: '100%',
    height: '700px',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },

  acceptanceBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    padding: '1rem',
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  acceptanceCheckbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#4facfe',
  },

  acceptanceLabel: {
    color: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    margin: 0,
  },

  canvasContainer: {
    border: '3px solid rgba(79, 172, 254, 0.5)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '1rem',
    marginBottom: '1rem',
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },

  canvas: {
    width: '100%',
    height: '200px',
    background: '#fff',
    cursor: 'crosshair',
    display: 'block',
  },

  signaturePreview: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(79, 172, 254, 0.5)',
    borderRadius: '12px',
    display: 'inline-block',
  },

  signatureLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.5rem',
  },

  signatureImg: {
    height: '100px',
    borderRadius: '8px',
    background: '#fff',
    padding: '0.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },

  instructionBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.8)',
  },
};