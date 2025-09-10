import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Busca el div con id="root" en public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
