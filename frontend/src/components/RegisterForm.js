import React, { useState, useEffect } from 'react';
import './register-form.css';

const faltasAdministrativas = [
  "Alteración al orden público",
  "Realizar necesidades fisiológicas en vía pública",
  "Realizar en cruceros actividades que pongan en riesgo la integridad física",
  "Ingerir bebidas embriagantes en vía pública",
  "Inhalar sustancias tóxicas en vía pública",
  "Pega de propaganda",
  "Faltas a la moral",
  "Arrojar en lugares no autorizados animales muertos, escombros y desperdicios",
  "Daños a los bienes del municipio",
  "Dañar, podar o talar árboles",
  "Trepar bardas o cualquier inmueble ajeno sin autorización",
  "Pasar la señal roja del semáforo",
  "Obstruir rampa para discapacitados",
  "Vender animales o mascotas en vía pública",
  "Otro"
];

const comunidadesArresto = [
  "ATOTONILCO",
  "BARRIO DE TROJES",
  "COLONIA CUAUHTÉMOC",
  "COLONIA FRANCISCO I MADERO",
  "COLONIA LUIS DONALDO COLOSIO",
  "DOLORES ENYEGE",
  "EJIDO 20 DE NOVIEMBRE",
  "EL RINCÓN DE LOS PERALES",
  "EL TECOMATE",
  "EMILIANO ZAPATA",
  "GUADALUPE CACHI",
  "GUADALUPE DEL RÍO",
  "HUEREJE",
  "IXTLAHUACA DE RAYÓN",
  "JALPA DE DOLORES",
  "JALPA DE LOS BAÑOS",
  "LA BANDERA",
  "LA CONCEPCIÓN DE LOS BAÑOS",
  "LA CONCEPCIÓN ENYEGE",
  "LA ESTACIÓN DEL FERROCARRIL",
  "LA GUADALUPANA",
  "LA PURISIMA",
  "SAN ANDRÉS DEL PEDREGAL",
  "SAN ANTONIO BONIXI",
  "SAN ANTONIO DE LOS REMEDIOS",
  "SAN BARTOLO DEL LLANO",
  "SAN CRISTÓBAL DE LOS BAÑOS",
  "SAN FRANCISCO DE ASÍS",
  "SAN FRANCISCO DE GUZMÁN",
  "SAN FRANCISCO DEL RÍO",
  "SAN FRANCISCO IXTLAHUACA",
  "SAN IGNACIO DEL PEDREGAL",
  "SAN ILDEFONSO",
  "SAN ISIDRO BOXIPE",
  "SAN JERÓNIMO IXTAPANTONGO",
  "SAN JERÓNIMO LA CAÑADA",
  "SAN JOAQUÍN EL JUNCO",
  "SAN JOAQUÍN LA CABECERA",
  "SAN JOSÉ DEL RÍO",
  "SAN JUAN DE LAS MANZANAS",
  "SAN LORENZO TOXICO",
  "SAN MATEO IXTLAHUACA",
  "SAN MIGUEL EL ALTO",
  "SAN MIGUEL ENYEGE",
  "SAN PABLO DE LOS REMEDIOS",
  "SAN PEDRO DE LOS BAÑOS",
  "SAN PEDRO LA CABECERA",
  "SANTA ANA IXTLAHUACA",
  "SANTA ANA LA LADERA",
  "SANTA MARÍA DE GUADALUPE",
  "SANTA MARÍA DEL LLANO",
  "SANTO DOMINGO DE GUZMÁN",
  "SANTO DOMINGO HUEREJE",
  "SHIRA"
];

export default function RegisterForm({ onNext, onMessage }) {
  const [form, setForm] = useState({
    first_name: '',
    alias: '', // Cambiado de middle_name a alias
    last_name: '',
    dob: '',
    gender: '',
    nationality: 'Mexicana',
    state: '',
    municipality: '',
    community: '',
    id_number: '',
    observaciones: '',
    falta_administrativa: '',
    falta_administrativa_otro: '',
    arrest_community: '',
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

    // Si selecciona "Otro", usar el texto personalizado
    const falta = form.falta_administrativa === "Otro"
      ? form.falta_administrativa_otro
      : form.falta_administrativa;

    if (!form.first_name || !form.last_name || !falta) {
      if (onMessage) onMessage({ type: 'error', text: 'Completa nombre, apellido y falta administrativa.' });
      return;
    }

    if (onNext) onNext(form);
    if (onMessage) onMessage({ type: 'success', text: 'Datos personales guardados, ahora captura foto y huellas.' });
  }

  function handleReset() {
    setForm({
      first_name: '',
      alias: '', // Cambiado de middle_name a alias
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
            <label className="block text-sm">Nombres</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} className="mt-1 input" />
          </div>

           <div>
            <label className="block text-sm">Apellidos</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} className="mt-1 input" />
          </div>
          <div>
            <label className="block text-sm">Alias</label> {/* Cambiado */}
            <input name="alias" value={form.alias} onChange={handleChange} className="mt-1 input" /> {/* Cambiado */}
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
              <option value="">Selecciona Genero</option>
              <option>Masculino</option>
              <option>Femenino</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Nacionalidad</label>
            <select name="nationality" value={form.nationality} onChange={handleChange} className="mt-1 input">
              <option>Mexicana</option>
              <option>Extranjera</option>
            </select>

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
            <select
              name="falta_administrativa"
              value={form.falta_administrativa}
              onChange={handleChange}
              className="mt-1 input"
            >
              <option value="">-- Selecciona una opción --</option>
              {faltasAdministrativas.map(falta => (
                <option key={falta} value={falta}>{falta}</option>
              ))}
            </select>
            {/* Mostrar input si selecciona "Otro" */}
            {form.falta_administrativa === "Otro" && (
              <input
                name="falta_administrativa_otro"
                value={form.falta_administrativa_otro}
                onChange={handleChange}
                className="mt-2 input"
                placeholder="Especifica la falta administrativa"
              />
            )}
          </div>
          <div>
            <label className="block text-sm">Comunidad del arresto</label>
            <select
              name="arrest_community"
              value={form.arrest_community}
              onChange={handleChange}
              className="mt-1 input select-scroll"
            >
              <option value="">Selecciona una comunidad</option>
              {comunidadesArresto.map(com => (
                <option key={com} value={com}>{com}</option>
              ))}
            </select>
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
