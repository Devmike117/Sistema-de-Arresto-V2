import React, { useState } from "react";
import Loader from "./components/Loader";
import RegisterForm from "./components/RegisterForm";
import FacialCapture from "./components/FacialCapture";
import FingerprintScan from "./components/FingerprintScan";
import Dashboard from "./components/Dashboard";
import Notification from "./components/Notification";
import FacialSearch from "./components/FacialSearch";
import SearchPeople from "./components/SearchPeople";
import Login from "./components/Login";
import './styles/global.css';
import HistoryArrestModal from "./components/HistoryArrestModal";

function App() {
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const [personData, setPersonData] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [fingerprintFile, setFingerprintFile] = useState(null);

  const [message, setMessage] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false); // Nuevo estado para mostrar el login

  const handleLoaderFinish = () => setLoading(false);

  // Cerrar sesión de administrador
  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentSection(0); // Vuelve a una sección por defecto, ej: "Buscar Personas"
    setMessage({ type: 'success', text: 'Sesión cerrada correctamente.' });
  };

  // Guardar datos de RegisterForm
  const handleNextFromRegister = (data) => {
    setPersonData(data);
    setCurrentSection(3);
    setMessage({ type: "success", text: "Datos guardados. Ahora captura foto y huellas." });
  };

  // Registrar persona y biometría
  const handleRegister = async () => {
    if (!personData) {
      setMessage({ type: "error", text: "Primero guarda los datos de la persona." });
      return;
    }

    const formData = new FormData();
    Object.keys(personData).forEach((key) => {
      const val = typeof personData[key] === "boolean" ? String(personData[key]) : personData[key] || "";
      formData.append(key, val);
    });

    if (photoFile) formData.append("photo", photoFile);
    if (fingerprintFile) formData.append("fingerprint", fingerprintFile);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `¡Registrado correctamente! ID: ${data.personId}` });
        setPersonData(null);
        setPhotoFile(null);
        setFingerprintFile(null);
        {/*Al terminar el registro y k¿mostrar el mensaje mandar a la sección de inicio */}
        setCurrentSection(null);
        setCurrentSection(0);

      } else {
        setMessage({ type: "error", text: data.error || "Error al registrar." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error al registrar. Revisa la consola." });
    }
  };

let sections = [
  {
    id: "inicio",
    title: "Búsqueda Facial",
    icon: <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}>familiar_face_and_zone</span>,
    content: <FacialSearch onMessage={setMessage} />,
  },
  {
    id: "buscar",
    title: "Buscar Personas",
    icon: <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}>group_search</span>,
    content: <SearchPeople onMessage={setMessage} HistoryArrestModal={HistoryArrestModal} />,
  },
  {
    id: "registro",
    title: "Registro",
    icon: <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}>person_add</span>,
    content: <RegisterForm onNext={handleNextFromRegister} onMessage={setMessage} />,
  },
  {
    id: "biometria",
    title: "Biometría",
    icon: <span className="material-symbols-outlined">fingerprint</span>,
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        {/* Contenedor de secciones izquierda/derecha */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
            gap: '2rem',
          }}
        >
          {/* Izquierda: Facial */}
          <div style={{ ...styles.biometricContainer, flex: 1 }}>
            <FacialCapture
              photoFile={photoFile}
              setPhotoFile={setPhotoFile}
              onMessage={setMessage}
            />
          </div>

          {/* Derecha: Huella */}
          <div style={{ ...styles.biometricContainer, flex: 1 }}>
            <FingerprintScan
              fingerprintFile={fingerprintFile}
              setFingerprintFile={setFingerprintFile}
              onMessage={setMessage}
            />
          </div>
        </div>

        {/* Botón centrado */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="submit"
            disabled={loading}
            onClick={handleRegister}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
            style={{
              ...styles.registerButton,
              ...(loading ? styles.registerButtonDisabled : {}),
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <span style={styles.buttonIcon}>
              {loading ? (
                <span
                  className="material-symbols-outlined"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  autorenew
                </span>
              ) : (
                <span className="material-symbols-outlined">person_add</span>
              )}
            </span>
            {loading ? "Registrando..." : "Registrar Persona"}
          </button>
        </div>
      </div>
    ),
      },
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}>dashboard</span>,
      content: <Dashboard onMessage={setMessage} />,
    },
  ];

  if (loading) return <Loader onFinish={handleLoaderFinish} />;

  // Si se hace clic en el botón de admin, muestra la página de Login
  if (showAdminLogin) {
    return (
      <>
        <Notification message={message} onClose={() => setMessage(null)} />
        <Login
          onLogin={() => {
            setIsAdminAuthenticated(true);
            setShowAdminLogin(false); // Oculta el login y vuelve a la app
            setCurrentSection(4); // ir a la seccion de busqueda facial
          }}
          onMessage={setMessage}
          onBack={() => setShowAdminLogin(false)} // <-- Añadido: para volver a la app
        />
      </>
    );
  }

  if (!started)
    return (
      <main style={styles.welcomeContainer}>
        <div style={styles.welcomeOverlay}>
          <div style={styles.welcomeCard}>
            <div style={styles.welcomeIcon}></div>
            <h1 style={{ ...styles.welcomeTitle, fontSize: '2rem' }}>Sistema Modular para la Gestión Operativa en Centros de Comando Municipal</h1>
            <p style={styles.welcomeSubtitle}>
              Sistema de identificación biométrica
            </p>
            <button onClick={() => setStarted(true)} style={styles.welcomeButton}>
              Comenzar →
            </button>
          </div>
        </div>
      </main>
    );

  return (
    <main style={styles.container}>
      <Notification message={message} onClose={() => setMessage(null)} />

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logo}>
              {/* imagen logo */}
              <img
                src="https://th.bing.com/th/id/R.eb6e5629278a9adf8ffd6d85998747d0?rik=Syphi5ks4Z7ljA&riu=http%3a%2f%2fbe32.mx%2fjsons%2fimg%2fclientes%2fgdhfe-32.jpg&ehk=RPMsfcqAXz8my3Wi2%2bvR0cuElqjAHwjmUzytVmahTVo%3d&risl=&pid=ImgRaw&r=0"
                alt="Logo"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
            <h1 style={styles.title}>Sistema Modular de Comando</h1>
          </div>
          <nav style={styles.nav}>
            {sections
              .filter(sec => isAdminAuthenticated || sec.id !== 'dashboard')
              .map((sec) => {
                const originalIndex = sections.findIndex(s => s.id === sec.id);
                return (
                  <button
                    key={sec.id}
                    style={{ ...styles.navButton, ...(currentSection === originalIndex ? styles.navButtonActive : {}) }}
                    onClick={() => setCurrentSection(originalIndex)}
                  >
                    <span style={styles.navIcon}>{sec.icon}</span>
                    <span style={styles.navText}>{sec.title}</span>
                  </button>
                );
              })}
            {/* Botón condicional: Administrador o Cerrar Sesión */}
            {isAdminAuthenticated ? (
              <button
                style={{
                  ...styles.navButton,
                  background: 'rgba(211, 47, 47, 0.3)',
                  border: '1px solid rgba(211, 47, 47, 0.5)',
                  padding: '0.5rem', // Padding reducido
                  width: '40px',     // Ancho fijo
                  height: '40px',    // Altura fija
                  borderRadius: '50%', // Lo hacemos circular
                  justifyContent: 'center', // Centramos el ícono
                }}
                onClick={handleLogout}
                title="Cerrar Sesión" // Tooltip para accesibilidad
              >
                <span style={styles.navIcon}>
                  <span className="material-symbols-outlined">logout</span>
                </span>
                {/* <span style={styles.navText}>Cerrar Sesión</span> */}
              </button>
            ) : (
              <button
                style={{
                  ...styles.navButton,
                  background: 'rgba(58, 123, 213, 0.2)',
                  border: '1px solid rgba(58, 123, 213, 0.4)',
                }}
                onClick={() => setShowAdminLogin(true)}
              >
                <span style={styles.navIcon}>
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                </span>
                <span style={styles.navText}>Administrador</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>{sections[currentSection].title}</h2>
        </div>
        <div style={styles.sectionContent}>
          {sections[currentSection].content}
        </div>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2025 Sistema Modular de Comando. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

const styles = {
  // Welcome Screen
  welcomeContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #2c3e50 0%, #4b6cb7 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  welcomeOverlay: {
    width: "100%",
    maxWidth: "600px",
    padding: "2rem"
  },
  welcomeCard: {
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "3rem",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  welcomeIcon: {
    fontSize: "4rem",
    marginBottom: "1rem"
  },
  welcomeTitle: {
    fontSize: "3rem",
    fontWeight: "800",
    color: "#fff",
    marginBottom: "0.5rem",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)"
  },
  welcomeSubtitle: {
    fontSize: "1.25rem",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "2rem"
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "2rem"
  },
  feature: {
    background: "rgba(255, 255, 255, 0.1)",
    padding: "1rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#fff",
    fontSize: "0.95rem"
  },
  featureIcon: {
    fontSize: "1.5rem"
  },
  welcomeButton: {
    background: "linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "1rem 3rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(58, 123, 213, 0.4)",
    transition: "all 0.3s ease",
    outline: "none"
  },

  // Main App
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #2c3e50 0%, #4b6cb7 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column"
  },

  // Header
  header: {
    background: "rgba(10, 25, 41, 0.5)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "1rem 2rem",
    position: "sticky",
    top: 0,
    zIndex: 100,
    padding: "0.9rem 1.9rem",
  },
  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem"
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    height: "35px"
  },
  logo: {
    fontSize: "2rem",
    background: "rgba(255, 255, 255, 0.2)",
    padding: "0.5rem",
    borderRadius: "12px"
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
  },
  nav: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap"
  },
  navButton: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    padding: "0.6rem 1rem",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
    outline: "none",
    boxShadow: "none",
  },

  navButtonActive: {
    background: "linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)",
    border: "1px solid #ffffff19",
    boxShadow: "0 4px 15px rgba(58, 123, 213, 0.4)",
    outline: "none",
  },

  navIcon: {
    fontSize: "1.2rem"
  },
  navText: {
    fontSize: "0.85rem"
  },

  // Section
  section: {
    flex: 1,
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%"
  },
  sectionHeader: {
    marginBottom: "2rem"
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#fff",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
  },
  sectionContent: {
    background: "rgba(10, 25, 41, 0.3)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },

  // Biometric Container
  biometricContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    alignItems: "start"
  },
  registerButton: {
    background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
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
    boxShadow: '0 4px 15px rgba(58, 123, 213, 0.4)',
    transition: 'all 0.3s ease',
    outline: 'none',
    whiteSpace: 'nowrap'
  },

  // Footer
  footer: {
    background: "rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem",
    textAlign: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)"
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "0.9rem",
    margin: 0
  }
};

export default App;