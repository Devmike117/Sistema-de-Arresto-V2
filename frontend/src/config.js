// Define la URL base de tu API.
// Para desarrollo local con port-forward:
const API_BASE_URL = 'http://localhost:5001';

// Para Kubernetes con NodePort (puede no funcionar en Docker Desktop Windows):
// const API_BASE_URL = 'http://localhost:30525';

export default API_BASE_URL;