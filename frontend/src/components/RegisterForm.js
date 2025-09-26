import React, { useState, useEffect } from 'react';
import './register-form.css';

export default function RegisterForm({ onNext, onMessage }) {
  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    dob: '',
    gender: 'Masculino',
    nationality: '',
    state: '',
    municipality: '',
    community: '',
    id_number: '',
    observaciones: '',
    falta_administrativa: '',
    arrest_community: '',  // nombre interno para no confundir con persona.community
    arresting_officer: '',
    folio: '',
    rnd: '',
    sentencia: ''
  });

  const [mexicoData, setMexicoData] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/Devmike117/DB-Mexico-JSON/master/M%C3%A9xico.json')
      .then(res => res.json())
      .then(data => {
        const estadosSimplificados = data.map(e => ({
          ...e,
          nombre: e.nombre.split(' de ')[0] // simplifica nombres largos
        }));
        setMexicoData(estadosSimplificados);
      })
      .catch(err => console.error('Error al cargar México.json:', err));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    if (name === 'state') {
      const estado = mexicoData.find(e => e.nombre === value);
      setMunicipios(estado?.municipios || []);
      setForm(prev => ({ ...prev, municipality: '', community: '' }));
      setLocalidades([]);
    }

    if (name === 'municipality') {
      const municipio = municipios.find(m => m.nombre === value);
      setLocalidades(municipio?.localidades || []);
      setForm(prev => ({ ...prev, community: '' }));
    }
  }

  function handleSave(e) {
    e.preventDefault();

    if (!form.first_name || !form.last_name || !form.falta_administrativa) {
      if (onMessage) onMessage({ type: 'error', text: 'Completa nombre, apellido y falta administrativa.' });
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
      state: '',
      municipality: '',
      community: '',
      id_number: '',
      observaciones: '',
      falta_administrativa: '',
      arrest_community: '',
      arresting_officer: '',
      folio: '',
      rnd: '',
      sentencia: ''
    });
    if (onMessage) onMessage(null);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Datos de la persona</h2>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
        {/* Nombre completo */}
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

        {/* Fecha, género, nacionalidad */}
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

        {/* Estado, municipio, comunidad */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Estado</label>
            <select name="state" value={form.state} onChange={handleChange} className="mt-1 input">
              <option value="">Selecciona un estado</option>
              {mexicoData.map((e, i) => <option key={i} value={e.nombre}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm">Municipio</label>
            <select name="municipality" value={form.municipality} onChange={handleChange} className="mt-1 input">
              <option value="">Selecciona un municipio</option>
              {municipios.map((m, i) => <option key={i} value={m.nombre}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm">Comunidad</label>
            <select name="community" value={form.community} onChange={handleChange} className="mt-1 input">
              <option value="">Selecciona una comunidad</option>
              {localidades.map((l, i) => <option key={i} value={l.nombre}>{l.nombre}</option>)}
            </select>
          </div>
        </div>
    



        {/* ID y observaciones */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">ID (INE / Pasaporte)</label>
            <input name="id_number" value={form.id_number} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Observaciones</label>
            <input name="observaciones" value={form.observaciones} onChange={handleChange} className="mt-1 input" />
          </div>
        </div>

        {/* Arresto: falta administrativa, comunidad, oficial */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Falta administrativa</label>
            <input name="falta_administrativa" value={form.falta_administrativa} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Comunidad del arresto</label>
            <input name="arrest_community" value={form.arrest_community} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Oficial</label>
            <input name="arresting_officer" value={form.arresting_officer} onChange={handleChange} className="mt-1 input" />
          </div>
        </div>

        {/* Folio, RND, sentencia */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Folio</label>
            <input name="folio" value={form.folio} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">RND</label>
            <input name="rnd" value={form.rnd} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Sentencia</label>
            <input name="sentencia" value={form.sentencia} onChange={handleChange} className="mt-1 input" />
          </div>
        </div>

        {/* Botones */}
        <div className="buttons-container">
          <button type="submit" className="btn-primary">Guardar y continuar</button>
          <button type="button" onClick={handleReset} className="btn-secondary">Limpiar</button>
        </div>
      </form>
    </div>
  );
}
