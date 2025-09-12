import React, { useState } from "react";
import Loader from "./components/Loader";
import styles from "./styles";
import RegisterForm from './components/RegisterForm';
import FacialCapture from './components/FacialCapture';
import FingerprintScan from './components/FingerprintScan';
import Dashboard from './components/Dashboard';


function App() {

  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const [personData, setPersonData] = useState(null); // Datos guardados de RegisterForm
  const [photoFile, setPhotoFile] = useState(null);
  const [fingerprintFile, setFingerprintFile] = useState(null);

  const handleLoaderFinish = () => setLoading(false);

  const handleNextFromRegister = (data) => {
    setPersonData(data);       // Guardar datos de la persona
    setCurrentSection(1);      // Pasar a sección de biometría
  };

  const handleRegister = async () => {
    if (!personData) return alert("Primero guarda los datos de la persona.");

    const formData = new FormData();
    Object.keys(personData).forEach(key => {
      const val = typeof personData[key] === 'boolean' ? String(personData[key]) : personData[key] || '';
      formData.append(key, val);
    });

    if (photoFile) formData.append('photo', photoFile);
    if (fingerprintFile) formData.append('fingerprint', fingerprintFile);

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(`¡Registrado correctamente! ID: ${data.personId}`);
        setPersonData(null);
        setPhotoFile(null);
        setFingerprintFile(null);
        setCurrentSection(2); // Ir a dashboard
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error al registrar. Revisa la consola.');
    }
  };

  const sections = [
    {
      id: "registro",
      title: "Formulario de Registro",
      content: <RegisterForm onNext={handleNextFromRegister} />
    },
    {
      id: "biometria",
      title: "Captura Biométrica",
      content: (
        <div style={styles.biometricContainer}>
          <FacialCapture photoFile={photoFile} setPhotoFile={setPhotoFile} />
          <FingerprintScan fingerprintFile={fingerprintFile} setFingerprintFile={setFingerprintFile} />
          <button
            onClick={handleRegister}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#9580ff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Registrar
          </button>
        </div>
      )
    },
    {
      id: "dashboard",
      title: "Panel de Control",
      content: <Dashboard />
    }
  ];

  if (loading) return <Loader onFinish={handleLoaderFinish} />;

  if (!started) return (
    <main style={{
      ...styles.container,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundImage: "url('/bienvenida.png')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: "#fff",
      textAlign: "center"
    }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.6)", padding: "2rem", borderRadius: "12px" }}>
        <h1>Bienvenido a BioRegistro</h1>
        <p>Identificación biométrica fácil y segura</p>
        <button
          onClick={() => setStarted(true)}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            backgroundColor: "#9580ff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Comenzar
        </button>
      </div>
    </main>
  );

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>BioRegistro</h1>
        <nav style={styles.nav}>
          <button onClick={() => setCurrentSection(0)}>Registro</button>
          <button onClick={() => setCurrentSection(1)}>Biometría</button>
          <button onClick={() => setCurrentSection(2)}>Dashboard</button>
        </nav>
      </header>

      <section style={styles.section} id={sections[currentSection].id}>
        <h2>{sections[currentSection].title}</h2>
        {sections[currentSection].content}
        {currentSection < sections.length - 1 && currentSection !== 1 && (
          <button
            style={{
              marginTop: "2rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              backgroundColor: "#9580ff",
              color: "#fff",
              border: "none",
              borderRadius: "4px"
            }}
            onClick={() => setCurrentSection(currentSection + 1)}
          >
            Siguiente sección
          </button>
        )}
      </section>

      <footer style={styles.footer}>
        <p>© 2025 BioRegistro. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

export default App;
