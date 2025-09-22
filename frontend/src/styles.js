const styles = {
  container: {
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    lineHeight: 1.6,
    color: '#eaeaea',
    backgroundColor: '#121212',
    minHeight: '100vh',
  },
  header: {
    backgroundColor: '#1f1f2e',
    color: '#ffffff',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  title: {
    margin: 0,
    fontSize: '2.5rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textAlign: 'center',
  },
  nav: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    fontSize: '1rem',
  },
  hero: {
    padding: '3rem 2rem',
    background: 'linear-gradient(135deg, #2c3e50, #34495e)',
    textAlign: 'center',
    color: '#ffffff',
    borderBottom: '1px solid #444',
  },
  section: {
    padding: '2.5rem',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#1e1e2f',
    borderRadius: '12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.4)',
    marginTop: '2rem',
  },
  biometricContainer: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  footer: {
    backgroundColor: '#1f1f2e',
    color: '#aaa',
    textAlign: 'center',
    padding: '1.5rem',
    marginTop: '3rem',
    fontSize: '0.9rem',
    borderTop: '1px solid #333',
  },

  biometricContainer: {
    display: "flex",
    flexDirection: "column", // Para apilar verticalmente
    alignItems: "center",    // Centra horizontalmente
    justifyContent: "center",// Centra verticalmente (si hay altura definida)
    textAlign: "center",     // Centra el texto
    padding: "2rem",         // Espaciado opcional
  },
  

};


export default styles;
