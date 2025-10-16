import React, { useState } from 'react';

const Login = ({ onLogin, onMessage, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            onMessage({ type: 'error', text: 'Por favor, completa ambos campos.' });
            return;
        }
        setLoading(true);
        // Simulación de llamada a API para autenticación
        setTimeout(() => {
            // En una aplicación real, aquí llamarías a tu backend
            if (email === 'admin@bioregistro.com' && password === 'admin123') {
                onLogin(); // Llama a la función del padre para actualizar el estado
            } else {
                onMessage({ type: 'error', text: 'Credenciales incorrectas.' });
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div style={styles.loginContainer}>
            <div style={styles.loginCard}>
                <h2 style={styles.title}>Acceso de Administrador</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="admin@bioregistro.com"
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="admin123"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>
                {onBack && (
                    <button onClick={onBack} style={styles.backButton}>
                        <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>arrow_back</span>
                        Volver al Inicio
                    </button>
                )}
            </div>
        </div>
    );
};

const styles = {
    loginContainer: {
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #4b6cb7 100%)',
    },
    loginCard: {
        background: 'rgba(10, 25, 41, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '16px',
        padding: '2.5rem', width: '100%', maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff', textAlign: 'center',
    },
    title: { marginBottom: '2rem', fontWeight: '700' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    inputGroup: { textAlign: 'left' },
    label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' },
    input: {
        width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)',
        background: 'rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box'
    },
    button: {
        background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)', color: '#fff', border: 'none',
        borderRadius: '10px', padding: '0.75rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
        transition: 'all 0.3s ease', marginTop: '1rem'
    },
    backButton: {
        background: 'transparent',
        color: 'rgba(255, 255, 255, 0.8)',
        border: 'none',
        marginTop: '1.5rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
        textDecoration: 'underline'
    },
    
};

export default Login;