import React, { useState } from "react";
import Loader from "./components/Loader";
import styles from "./styles";
import RegisterForm from "./components/RegisterForm";
import FacialCapture from "./components/FacialCapture";
import FingerprintScan from "./components/FingerprintScan";
import Dashboard from "./components/Dashboard";
import Notification from "./components/Notification";

function App() {
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const [personData, setPersonData] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [fingerprintFile, setFingerprintFile] = useState(null);

  const [message, setMessage] = useState(null);

  const handleLoaderFinish = () => setLoading(false);


  // Guardar datos de RegisterForm
  const handleNextFromRegister = (data) => {
    setPersonData(data);
    setCurrentSection(1); // Pasar a biometría
    setMessage({ type: "success", text: "Datos guardados. Ahora captura foto y huellas." });
  };

  // Registrar en backend
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
        setCurrentSection(2); // Ir a dashboard
      } else {
        setMessage({ type: "error", text: data.error || "Error al registrar." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error al registrar. Revisa la consola." });
    }
  };

  const sections = [
    {
      id: "registro",
      title: "Formulario de Registro",
      content: <RegisterForm onNext={handleNextFromRegister} onMessage={setMessage} />,
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
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#9580ff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              textAlign: "left",
            }}
          >
            Registrar
          </button>
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Panel de Control",
      content: <Dashboard />,
    },
  ];

  if (loading) return <Loader onFinish={handleLoaderFinish} />;

  if (!started)
    return (
      <main
        style={{
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
          textAlign: "center",
        }}
      >
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
              cursor: "pointer",
            }}
          >
            Comenzar
          </button>
        </div>
      </main>
    );

  return (
    <main style={styles.container}>
      {/* Notificación flotante */}
      <Notification message={message} onClose={() => setMessage(null)} />

      <header style={styles.header}>
        <h1 style={styles.title}>BioRegistro</h1>
        <nav style={styles.nav}>
          <button
            style={{
              backgroundColor: "#9580ff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              marginRight: "0.5rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => setCurrentSection(0)}
          >
            Registro
          </button>
          <button
            style={{
              backgroundColor: "#9580ff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              marginRight: "0.5rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => setCurrentSection(1)}
          >
            Biometría
          </button>
          <button
            style={{
              backgroundColor: "#9580ff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => setCurrentSection(2)}
          >
            Dashboard
          </button>
        </nav>
      </header>

      <section style={styles.section} id={sections[currentSection].id}>
        <h2>{sections[currentSection].title}</h2>
        {sections[currentSection].content}
      </section>

      <footer style={styles.footer}>
        <p>© 2025 BioRegistro. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

export default App;
