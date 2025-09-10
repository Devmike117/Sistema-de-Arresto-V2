// Componente principal React
import React from 'react';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import FacialCapture from './components/FacialCapture';
import FingerprintScan from './components/FingerprintScan';

function App() {
  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>BioRegistro</h1>
        <nav style={styles.nav}>
          <a href="#registro">Registro</a>
          <a href="#biometria">Biometría</a>
          <a href="#dashboard">Dashboard</a>
        </nav>
      </header>

      <section style={styles.hero}>
        <h2>Identificación biométrica fácil y segura</h2>
        <p>
          Registra personas de forma eficiente utilizando reconocimiento facial y escaneo de huellas digitales.
        </p>
      </section>

      <section id="registro" style={styles.section}>
        <h2>Formulario de Registro</h2>
        <RegisterForm />
      </section>

      <section id="biometria" style={styles.section}>
        <h2>Captura Biométrica</h2>
        <div style={styles.biometricContainer}>
          <FacialCapture />
          <FingerprintScan />
        </div>
      </section>

      <section id="dashboard" style={styles.section}>
        <h2>Panel de Control</h2>
        <Dashboard />
      </section>

      <footer style={styles.footer}>
        <p>© 2025 BioRegistro. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    padding: '1.5rem',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
  },
  nav: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
  },
  hero: {
    padding: '2rem',
    backgroundColor: '#ecf0f1',
    textAlign: 'center',
  },
  section: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  biometricContainer: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    textAlign: 'center',
    padding: '1rem',
    marginTop: '2rem',
  },
};

export default App;
