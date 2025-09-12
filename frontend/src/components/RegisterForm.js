import React, { useState } from 'react';
import './register-form.css';

export default function RegisterForm({ onNext, onMessage }) {
  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    dob: '',
    gender: 'Masculino',
    nationality: '',
    address: '',
    phone_number: '',
    id_number: '',
    notes: '',
    offense: '',
    location: '',
    arresting_officer: '',
    case_number: '',
    bail_status: false
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSave(e) {
    e.preventDefault();

    if (!form.first_name || !form.last_name || !form.offense) {
      if (onMessage) onMessage({ type: 'error', text: 'Completa nombre, apellido y motivo del arresto.' });
      return;
    }

    if (onNext) onNext(form);

    if (onMessage) onMessage({ type: 'success', text: 'Datos personales guardados, ahora captura foto y huellas.' });
  }

  function handleReset() {
    setForm({
      first_name: '',
      middle_name: '',
      last_name: '',
      dob: '',
      gender: 'Masculino',
      nationality: '',
      address: '',
      phone_number: '',
      id_number: '',
      notes: '',
      offense: '',
      location: '',
      arresting_officer: '',
      case_number: '',
      bail_status: false
    });
    if (onMessage) onMessage(null);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Datos de la persona</h2>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
        {/* Nombre, segundo nombre y apellido */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Nombre</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Segundo nombre</label>
            <input name="middle_name" value={form.middle_name} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Apellido</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} className="mt-1 input" />
          </div>
        </div>

        {/* Fecha de nacimiento, género, nacionalidad */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Fecha de nacimiento</label>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Género</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="mt-1 input">
              <option>Masculino</option>
              <option>Femenino</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Nacionalidad</label>
            <input name="nationality" value={form.nationality} onChange={handleChange} className="mt-1 input" />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm">Dirección</label>
          <input name="address" value={form.address} onChange={handleChange} className="mt-1 input" />
        </div>

        {/* Teléfono, ID, fianza */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Teléfono</label>
            <input name="phone_number" value={form.phone_number} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">ID (INE / Pasaporte)</label>
            <input name="id_number" value={form.id_number} onChange={handleChange} className="mt-1 input" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input type="checkbox" name="bail_status" checked={form.bail_status} onChange={handleChange} className="mr-2" />
              <span className="text-sm">Liberado bajo fianza</span>
            </label>
          </div>
        </div>

        {/* Delito, lugar, oficial */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Delito</label>
            <input name="offense" value={form.offense} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Lugar</label>
            <input name="location" value={form.location} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Oficial</label>
            <input name="arresting_officer" value={form.arresting_officer} onChange={handleChange} className="mt-1 input" />
          </div>
        </div>

        {/* No. caso y observaciones */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">No. de caso</label>
            <input name="case_number" value={form.case_number} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Observaciones</label>
            <input name="notes" value={form.notes} onChange={handleChange} className="mt-1 input" />
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 mt-4">
          <button type="submit" className="btn-primary">
            Guardar y continuar
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary">
            Limpiar
          </button>
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
        }

        .btn-primary {
          padding: 0.5rem 1rem;
          background-color: #9580ff;
          color: #fff;
          border-radius: 0.375rem;
          font-weight: bold;
          border: none;
          cursor: pointer;
        }

        .btn-primary:hover {
          background-color: #7a63e6;
        }

        .btn-secondary {
          padding: 0.5rem 1rem;
          background-color: #f3f4f6;
          color: #111;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
