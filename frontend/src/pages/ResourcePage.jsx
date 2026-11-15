import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const emptyForms = {
  vehiculos: { marca: '', modelo: '', patente: '', anio: '', capacidad_carga: '' },
  conductores: {
    nombre: '', apellido: '', numero_documento: '', numero_licencia: '',
    fecha_alta_licencia: '', fecha_vencimiento_licencia: '',
  },
  viajes: {
    vehiculo_id: '', conductor_id: '', fecha_salida: '', fecha_llegada: '',
    origen: '', destino: '', kilometros: '', observaciones: '',
  },
};

const resourceTitles = {
  vehiculos: 'Vehículos',
  conductores: 'Conductores',
  viajes: 'Viajes',
};

function Field({ label, name, value, onChange, type = 'text', required = true }) {
  return (
    <label>
      {label}
      <input name={name} type={type} value={value} onChange={onChange} required={required} />
    </label>
  );
}

export default function ResourcePage({ resource }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForms[resource]);
  const [editingId, setEditingId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [filterType, setFilterType] = useState('vehiculo');
  const [totalKm, setTotalKm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadItems = useCallback(async (filters = {}) => {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value),
    ).toString();
    setLoading(true);
    try {
      setItems(await api(`/${resource}${query ? `?${query}` : ''}`));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    setForm(emptyForms[resource]);
    setEditingId(null);
    setMessage('');
    setTotalKm(null);
    loadItems();
    if (resource === 'viajes') {
      Promise.all([api('/vehiculos'), api('/conductores')])
        .then(([loadedVehicles, loadedDrivers]) => {
          setVehicles(loadedVehicles);
          setDrivers(loadedDrivers);
        })
        .catch((err) => setError(err.message));
    }
  }, [loadItems, resource]);

  const changeForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await api(editingId ? `/${resource}/${editingId}` : `/${resource}`, {
        method: editingId ? 'PUT' : 'POST',
        body: form,
      });
      setMessage(editingId ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.');
      setForm(emptyForms[resource]);
      setEditingId(null);
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm(Object.fromEntries(
      Object.keys(emptyForms[resource]).map((key) => [key, item[key] ?? '']),
    ));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('¿Querés eliminar este registro?')) return;
    try {
      await api(`/${resource}/${id}`, { method: 'DELETE' });
      setMessage('Registro eliminado correctamente.');
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForms[resource]);
  };

  const renderVehicleForm = () => (
    <>
      <Field label="Marca" name="marca" value={form.marca} onChange={changeForm} />
      <Field label="Modelo" name="modelo" value={form.modelo} onChange={changeForm} />
      <Field label="Patente" name="patente" value={form.patente} onChange={changeForm} />
      <Field label="Año" name="anio" type="number" value={form.anio} onChange={changeForm} />
      <Field label="Capacidad de carga (kg)" name="capacidad_carga" type="number" value={form.capacidad_carga} onChange={changeForm} />
    </>
  );

  const renderDriverForm = () => (
    <>
      <Field label="Nombre" name="nombre" value={form.nombre} onChange={changeForm} />
      <Field label="Apellido" name="apellido" value={form.apellido} onChange={changeForm} />
      <Field label="Número de documento" name="numero_documento" value={form.numero_documento} onChange={changeForm} />
      <Field label="Número de licencia" name="numero_licencia" value={form.numero_licencia} onChange={changeForm} />
      <Field label="Alta de licencia" name="fecha_alta_licencia" type="date" value={form.fecha_alta_licencia} onChange={changeForm} />
      <Field label="Vencimiento de licencia" name="fecha_vencimiento_licencia" type="date" value={form.fecha_vencimiento_licencia} onChange={changeForm} />
    </>
  );

  const renderTripForm = () => (
    <>
      <label>Vehículo
        <select name="vehiculo_id" value={form.vehiculo_id} onChange={changeForm} required>
          <option value="">Seleccionar...</option>
          {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.marca} {vehicle.modelo} ({vehicle.patente})</option>)}
        </select>
      </label>
      <label>Conductor
        <select name="conductor_id" value={form.conductor_id} onChange={changeForm} required>
          <option value="">Seleccionar...</option>
          {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.nombre} {driver.apellido}</option>)}
        </select>
      </label>
      <Field label="Fecha de salida" name="fecha_salida" type="datetime-local" value={form.fecha_salida} onChange={changeForm} />
      <Field label="Fecha de llegada" name="fecha_llegada" type="datetime-local" value={form.fecha_llegada} onChange={changeForm} />
      <Field label="Origen" name="origen" value={form.origen} onChange={changeForm} />
      <Field label="Destino" name="destino" value={form.destino} onChange={changeForm} />
      <Field label="Kilómetros" name="kilometros" type="number" value={form.kilometros} onChange={changeForm} />
      <Field label="Observaciones (opcional)" name="observaciones" value={form.observaciones} onChange={changeForm} required={false} />
    </>
  );

  const renderTable = () => {
    if (resource === 'vehiculos') return (
      <Table headers={['Marca', 'Modelo', 'Patente', 'Año', 'Capacidad (kg)', 'Acciones']}>
        {items.map((item) => <tr key={item.id}><td>{item.marca}</td><td>{item.modelo}</td><td>{item.patente}</td><td>{item.anio}</td><td>{item.capacidad_carga}</td><Actions item={item} /></tr>)}
      </Table>
    );
    if (resource === 'conductores') return (
      <Table headers={['Nombre', 'Apellido', 'Documento', 'Licencia', 'Alta', 'Vencimiento', 'Acciones']}>
        {items.map((item) => <tr key={item.id}><td>{item.nombre}</td><td>{item.apellido}</td><td>{item.numero_documento}</td><td>{item.numero_licencia}</td><td>{item.fecha_alta_licencia}</td><td>{item.fecha_vencimiento_licencia}</td><Actions item={item} /></tr>)}
      </Table>
    );
    return (
      <Table headers={['Vehículo', 'Conductor', 'Salida', 'Llegada', 'Origen', 'Destino', 'Km', 'Observaciones', 'Acciones']}>
        {items.map((item) => <tr key={item.id}><td>{item.patente}</td><td>{item.conductor}</td><td>{item.fecha_salida}</td><td>{item.fecha_llegada}</td><td>{item.origen}</td><td>{item.destino}</td><td>{item.kilometros}</td><td>{item.observaciones}</td><Actions item={item} /></tr>)}
      </Table>
    );
  };

  function Actions({ item }) {
    return <td className="actions">{resource !== 'viajes' && <button type="button" className="btn small" onClick={() => edit(item)}>Editar</button>}<button type="button" className="btn danger small" onClick={() => remove(item.id)}>Eliminar</button></td>;
  }

  return (
    <section className="resource-page">
      <h1>{resourceTitles[resource]}</h1>
      <form className="panel resource-form" onSubmit={submit}>
        <h2>{editingId ? `Editar ${resourceTitles[resource].slice(0, -1).toLowerCase()}` : `Nuevo ${resourceTitles[resource].slice(0, -1).toLowerCase()}`}</h2>
        <div className="form-grid">{resource === 'vehiculos' ? renderVehicleForm() : resource === 'conductores' ? renderDriverForm() : renderTripForm()}</div>
        <div className="form-actions"><button className="btn">{editingId ? 'Guardar cambios' : resource === 'viajes' ? 'Registrar viaje' : `Crear ${resource === 'vehiculos' ? 'vehículo' : 'conductor'}`}</button>{editingId && <button type="button" className="btn secondary" onClick={cancelEdit}>Cancelar</button>}</div>
      </form>

      {resource === 'viajes' && (
        <div className="panel">
          <h2>Historial</h2>
          <div className="filters">
            <label>Consultar por
              <select value={filterType} onChange={(event) => { setFilterType(event.target.value); setFilterDriver(''); setFilterVehicle(''); }}>
                <option value="vehiculo">Vehículo</option>
                <option value="conductor">Conductor</option>
              </select>
            </label>
            {filterType === 'vehiculo' ? (
              <label>Vehículo
                <select value={filterVehicle} onChange={(event) => setFilterVehicle(event.target.value)}>
                  <option value="">Todos</option>
                  {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.patente}</option>)}
                </select>
              </label>
            ) : (
              <label>Conductor
                <select value={filterDriver} onChange={(event) => setFilterDriver(event.target.value)}>
                  <option value="">Todos</option>
                  {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.nombre} {driver.apellido}</option>)}
                </select>
              </label>
            )}
          </div>
          <div className="form-actions"><button type="button" className="btn" onClick={() => loadItems({ vehiculo_id: filterVehicle, conductor_id: filterDriver })}>Filtrar</button><button type="button" className="btn secondary" onClick={() => { setFilterVehicle(''); setFilterDriver(''); loadItems(); }}>Ver todos</button><button type="button" className="btn" onClick={async () => setTotalKm((await api(`/viajes/km?${new URLSearchParams({ vehiculo_id: filterVehicle, conductor_id: filterDriver })}`)).total_km)}>Calcular km totales</button></div>
          {totalKm !== null && <p className="total">Total: {totalKm} km</p>}
        </div>
      )}

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading ? <p>Cargando...</p> : items.length ? renderTable() : <p>No hay {resourceTitles[resource].toLowerCase()} cargados.</p>}
    </section>
  );
}

function Table({ headers, children }) {
  return <div className="table-wrapper"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
