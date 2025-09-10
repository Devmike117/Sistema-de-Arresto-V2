// Formulario de registro
import React from 'react';

function RegisterForm() {
  return (
    <form>
      <label>Nombre:</label>
      <input type="text" name="nombre" />

      <label>Edad:</label>
      <input type="number" name="edad" />

      <label>Género:</label>
      <select name="genero">
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
      </select>

      <button type="submit">Registrar</button>
    </form>
  );
}

export default RegisterForm;
