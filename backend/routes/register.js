import React, { useState } from "react";

function RegisterForm({ setPersonId }) {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    dob: "",
    gender: "",
    nationality: "",
    address: "",
    phone_number: "",
    id_number: "",
    notes: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/persons/create-person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setPersonId(data.personId); // guardamos el id
        setMessage("✅ Persona registrada. ID: " + data.personId);
      } else {
        setMessage("❌ Error: " + data.error);
      }
    } catch (error) {
      setMessage("⚠️ Error en la conexión con el servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Nombre:</label>
      <input type="text" name="first_name" onChange={handleChange} />

      <label>Apellido paterno:</label>
      <input type="text" name="middle_name" onChange={handleChange} />

      <label>Apellido materno:</label>
      <input type="text" name="last_name" onChange={handleChange} />

      <label>Fecha de nacimiento:</label>
      <input type="date" name="dob" onChange={handleChange} />

      <label>Género:</label>
      <select name="gender" onChange={handleChange}>
        <option value="">Selecciona</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
      </select>

      <label>Nacionalidad:</label>
      <input type="text" name="nationality" onChange={handleChange} />

      <label>Dirección:</label>
      <input type="text" name="address" onChange={handleChange} />

      <label>Teléfono:</label>
      <input type="text" name="phone_number" onChange={handleChange} />

      <label>ID / CURP:</label>
      <input type="text" name="id_number" onChange={handleChange} />

      <label>Notas:</label>
      <textarea name="notes" onChange={handleChange}></textarea>

      <button type="submit">Guardar datos</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default RegisterForm;
