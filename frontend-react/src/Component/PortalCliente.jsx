import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PortalCliente.css';
import { apiUrl } from '../apiConfig';

const API_RESERVAS = apiUrl('/reservas');
const API_CLIENTES = apiUrl('/clientes');

const mayuscula = (valor = '') => valor.toUpperCase();
const minuscula = (valor = '') => valor.toLowerCase();
const estadoActivo = (estado = '') => ['ACTIVA', 'PRORROGADA'].includes(estado);

const inicioMesActual = () => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-01`;
};

const finMesActual = () => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
};

const PortalCliente = () => {
    const navigate = useNavigate();
    const [clienteCedulaActual, setClienteCedulaActual] = useState(localStorage.getItem('clienteCedula') || '');
    const [reservas, setReservas] = useState([]);
    const [vehiculosCliente, setVehiculosCliente] = useState([]);
    const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState('NUEVO');
    const [vehiculoActivo, setVehiculoActivo] = useState(null);
    const [clienteEncontrado, setClienteEncontrado] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [filtroInicio, setFiltroInicio] = useState(inicioMesActual());
    const [filtroFin, setFiltroFin] = useState(finMesActual());
    const [form, setForm] = useState({
        cliente_cedula: clienteCedulaActual,
        cliente_nombre: '',
        cliente_telefono: '',
        cliente_correo: '',
        placa: '',
        tipo_vehiculo: 'AUTOMOVIL',
        marca: '',
        color: '',
        modelo: ''
    });

    const limpiarDatosDependientes = (cedula = '') => {
        setReservas([]);
        setVehiculosCliente([]);
        setVehiculoSeleccionado('NUEVO');
        setVehiculoActivo(null);
        setClienteEncontrado(false);
        setForm({
            cliente_cedula: cedula,
            cliente_nombre: '',
            cliente_telefono: '',
            cliente_correo: '',
            placa: '',
            tipo_vehiculo: 'AUTOMOVIL',
            marca: '',
            color: '',
            modelo: ''
        });
    };

    const reservaActiva = useMemo(
        () => reservas.find(reserva => estadoActivo(reserva.estado)),
        [reservas]
    );

    const reservasFiltradas = useMemo(() => {
        const inicio = filtroInicio ? new Date(`${filtroInicio}T00:00:00`) : null;
        const fin = filtroFin ? new Date(`${filtroFin}T23:59:59`) : null;
        return reservas.filter(reserva => {
            const fecha = new Date(reserva.fecha_reserva || reserva.fechaReserva || reserva.vence_en || reserva.venceEn);
            if (inicio && fecha < inicio) return false;
            if (fin && fecha > fin) return false;
            return true;
        });
    }, [reservas, filtroInicio, filtroFin]);

    const calcularValorActual = (registro) => {
        if (!registro?.fecha_entrada && !registro?.fechaEntrada) return { minutos: 0, total: 0 };
        const inicio = new Date(registro.fecha_entrada || registro.fechaEntrada);
        const minutos = Math.max(1, Math.floor((Date.now() - inicio.getTime()) / 60000));
        const tipo = String(registro.tipo_vehiculo || registro.tipoVehiculo || '').toUpperCase();
        const tarifa = tipo.includes('MOTO') ? 30 : tipo.includes('PESADO') ? 70 : 50;
        return { minutos, total: minutos * tarifa, tarifa };
    };

    const aplicarVehiculo = (vehiculo) => {
        if (!vehiculo || vehiculo === 'NUEVO') {
            setVehiculoSeleccionado('NUEVO');
            setForm(prev => ({ ...prev, placa: '', tipo_vehiculo: 'AUTOMOVIL', marca: '', color: '', modelo: '' }));
            return;
        }

        setVehiculoSeleccionado(vehiculo.placa);
        setForm(prev => ({
            ...prev,
            placa: vehiculo.placa || '',
            tipo_vehiculo: vehiculo.tipoVehiculo || vehiculo.tipo_vehiculo || 'AUTOMOVIL',
            marca: vehiculo.marca || '',
            color: vehiculo.color || '',
            modelo: vehiculo.modelo || ''
        }));
    };

    const cargarDatosCliente = async (cedula = form.cliente_cedula) => {
        const identificacion = mayuscula(cedula).replace(/[^0-9A-Z]/g, '');
        if (identificacion.length < 5) return;
        setClienteCedulaActual(identificacion);
        localStorage.setItem('clienteCedula', identificacion);

        try {
            const [clienteRes, reservasRes, activosRes] = await Promise.all([
                fetch(`${API_CLIENTES}/buscar/${encodeURIComponent(identificacion)}`),
                fetch(`${API_RESERVAS}/cliente/${encodeURIComponent(identificacion)}`),
                fetch(apiUrl('/registros/activos'))
            ]);

            if (clienteRes.ok) {
                const cliente = await clienteRes.json();
                const vehiculos = Array.isArray(cliente.vehiculos) ? cliente.vehiculos : [];
                setClienteEncontrado(true);
                setVehiculosCliente(vehiculos);
                setForm(prev => ({
                    ...prev,
                    cliente_cedula: identificacion,
                    cliente_nombre: cliente.nombreCompleto || prev.cliente_nombre,
                    cliente_telefono: cliente.telefono || prev.cliente_telefono,
                    cliente_correo: cliente.correo || prev.cliente_correo
                }));
                if (vehiculos.length > 0 && vehiculoSeleccionado === 'NUEVO' && !form.placa) {
                    aplicarVehiculo(vehiculos[0]);
                }
                setMensaje(`Cliente encontrado. Vehiculos registrados: ${vehiculos.length}.`);
            } else {
                limpiarDatosDependientes(identificacion);
                setClienteEncontrado(false);
                setVehiculosCliente([]);
                setVehiculoSeleccionado('NUEVO');
                setMensaje('Cliente nuevo. Complete los datos y registre el vehiculo.');
            }

            if (reservasRes.ok) {
                const dataReservas = await reservasRes.json();
                const listaReservas = Array.isArray(dataReservas) ? dataReservas : [];
                setReservas(listaReservas);
                const correoHistorico = listaReservas.find(item => item.cliente_correo || item.clienteCorreo);
                if (correoHistorico) {
                    setForm(prev => ({
                        ...prev,
                        cliente_correo: prev.cliente_correo || correoHistorico.cliente_correo || correoHistorico.clienteCorreo || ''
                    }));
                }
            }

            if (activosRes.ok) {
                const activos = await activosRes.json();
                const activo = activos.find(item => String(item.propietario_cedula || item.propietarioCedula || '') === identificacion);
                setVehiculoActivo(activo || null);
            }
        } catch (error) {
            setMensaje('No se pudo consultar el cliente.');
        }
    };

    useEffect(() => {
        if (clienteCedulaActual) cargarDatosCliente(clienteCedulaActual);
    }, []);

    const actualizarCampo = (campo, valor) => {
        const normalizado = campo === 'cliente_correo' ? minuscula(valor) : mayuscula(valor);
        setForm(prev => ({ ...prev, [campo]: normalizado }));
    };

    const actualizarCedula = (valor) => {
        const normalizado = mayuscula(valor).replace(/[^0-9A-Z]/g, '');
        if (normalizado !== form.cliente_cedula) {
            limpiarDatosDependientes(normalizado);
            setMensaje('');
            localStorage.removeItem('clienteCedula');
        }
    };

    const guardarDatosCliente = async () => {
        if (!form.cliente_cedula || !form.cliente_nombre) {
            return setMensaje('Digite cedula/NIT y nombre para guardar los datos del cliente.');
        }

        setCargando(true);
        try {
            const res = await fetch(API_CLIENTES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identificacion: form.cliente_cedula,
                    nombreCompleto: form.cliente_nombre,
                    telefono: form.cliente_telefono,
                    correo: form.cliente_correo
                })
            });

            if (!res.ok) throw new Error('No se pudieron guardar los datos del cliente.');
            setMensaje(clienteEncontrado ? 'Datos del cliente actualizados correctamente.' : 'Datos del cliente guardados correctamente.');
            await cargarDatosCliente(form.cliente_cedula);
        } catch (error) {
            setMensaje(error.message);
        } finally {
            setCargando(false);
        }
    };

    const salirPortal = () => {
        localStorage.removeItem('clienteCedula');
        setClienteCedulaActual('');
        setMensaje('');
        limpiarDatosDependientes('');
        navigate('/');
    };

    const crearReserva = async (e) => {
        e.preventDefault();
        setMensaje('');
        setCargando(true);
        try {
            const res = await fetch(API_RESERVAS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(typeof data === 'string' ? data : 'No se pudo crear la reserva.');

            localStorage.setItem('clienteCedula', form.cliente_cedula);
            setClienteCedulaActual(form.cliente_cedula);
            setReservas(prev => [data, ...prev]);
            setVehiculoActivo(null);
            setMensaje(`Reserva creada. Cupo asignado: ${data.lugar_asignado || data.lugarAsignado}`);
            await cargarDatosCliente(form.cliente_cedula);
        } catch (error) {
            setMensaje(error.message);
        } finally {
            setCargando(false);
        }
    };

    const prorrogarReserva = async () => {
        if (!reservaActiva) return;
        const referencia = window.prompt('Referencia de pago de prorroga ($1.000). Ej: NEQUI 3001234567');
        if (referencia === null) return;

        setCargando(true);
        try {
            const res = await fetch(`${API_RESERVAS}/${reservaActiva.id}/prorrogar?metodoPago=NEQUI&referencia=${encodeURIComponent(referencia)}`, { method: 'PUT' });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(typeof data === 'string' ? data : 'No se pudo prorrogar.');
            setReservas(prev => prev.map(item => item.id === data.id ? data : item));
            setMensaje('Prorroga registrada por 10 minutos. Valor: $1.000.');
        } catch (error) {
            setMensaje(error.message);
        } finally {
            setCargando(false);
        }
    };

    const cancelarReserva = async () => {
        if (!reservaActiva || !window.confirm('Desea cancelar la reserva y liberar el cupo?')) return;
        setCargando(true);
        try {
            const res = await fetch(`${API_RESERVAS}/${reservaActiva.id}/cancelar`, { method: 'PUT' });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(typeof data === 'string' ? data : 'No se pudo cancelar.');
            setReservas(prev => prev.map(item => item.id === data.id ? data : item));
            setMensaje('Reserva cancelada. El cupo queda libre.');
        } catch (error) {
            setMensaje(error.message);
        } finally {
            setCargando(false);
        }
    };

    const imprimirTicketReserva = (reserva = reservaActiva) => {
        if (!reserva) return;
        const urlIngreso = `${window.location.origin}/entrada?reserva=${encodeURIComponent(reserva.codigoReserva)}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(urlIngreso)}`;
        const ventana = window.open('', '_blank', 'width=380,height=650');
        ventana.document.write(`
            <html><head><title>Ticket de Reserva - Parqueadero LOT</title>
            <style>body{font-family:Arial,sans-serif;margin:0;padding:18px;text-align:center}.ticket{max-width:310px;margin:0 auto}h2{margin:0 0 6px}p{margin:6px 0;font-size:13px}.placa{font-size:28px;font-weight:900;letter-spacing:5px;margin:10px 0}.linea{border-top:1px dashed #333;margin:12px 0}.detalle{text-align:left}.qr{margin:12px auto 6px;width:170px;height:170px}.nota{font-size:11px;color:#333}</style>
            </head><body><div class="ticket"><h2>PARQUEADERO LOT</h2><p>Ticket de reserva</p><hr>
            <div class="placa">${reserva.placa}</div><div class="detalle">
            <p><strong>Reserva:</strong> ${reserva.codigoReserva}</p>
            <p><strong>Cupo:</strong> ${reserva.lugar_asignado || reserva.lugarAsignado}</p>
            <p><strong>Cliente:</strong> ${reserva.cliente_nombre || reserva.clienteNombre}</p>
            <p><strong>Estado:</strong> ${reserva.estado}</p>
            <p><strong>Vence:</strong> ${new Date(reserva.vence_en || reserva.venceEn).toLocaleString('es-CO')}</p>
            </div><div class="linea"></div><img class="qr" src="${qrUrl}" alt="QR de reserva" />
            <p class="nota">Operario: escanee este QR para confirmar el ingreso.</p><p class="nota">${urlIngreso}</p></div>
            <script>window.onload=function(){setTimeout(function(){window.print();},400);};</script></body></html>
        `);
        ventana.document.close();
    };

    const formatoFecha = (fecha) => fecha ? new Date(fecha).toLocaleString('es-CO') : '--';
    const minutosRestantes = (fecha) => {
        if (!fecha) return '--';
        const minutos = Math.ceil((new Date(fecha).getTime() - Date.now()) / 60000);
        return minutos > 0 ? `${minutos} min` : 'Vencida';
    };

    return (
        <main className="portal-cliente">
            <section className="cliente-hero">
                <div>
                    <h1>Portal Cliente</h1>
                    <p>Ingrese primero la cedula o NIT para consultar datos, vehiculos e historial de reservas.</p>
                </div>
                <button type="button" className="cliente-salir" onClick={salirPortal}>
                    Salir
                </button>
            </section>

            {mensaje && <div className="cliente-alerta">{mensaje}</div>}

            <section className="cliente-grid">
                <form className="cliente-panel" onSubmit={crearReserva}>
                    <h2>Reservar cupo</h2>
                    <div className="cliente-form-grid">
                        <input
                            className="cliente-id-principal"
                            placeholder="Cedula / NIT"
                            value={form.cliente_cedula}
                            onChange={(e) => actualizarCedula(e.target.value)}
                            onBlur={() => cargarDatosCliente(form.cliente_cedula)}
                            required
                        />
                        <button type="button" className="btn-consultar-cliente" onClick={() => cargarDatosCliente(form.cliente_cedula)}>Consultar</button>
                        <input placeholder="Nombre completo" value={form.cliente_nombre} onChange={(e) => actualizarCampo('cliente_nombre', e.target.value)} required />
                        <input placeholder="Telefono" value={form.cliente_telefono} onChange={(e) => actualizarCampo('cliente_telefono', e.target.value.replace(/[^0-9]/g, ''))} />
                        <input className="email-lowercase" placeholder="Correo" value={form.cliente_correo} onChange={(e) => actualizarCampo('cliente_correo', e.target.value)} />
                        <button type="button" className="btn-guardar-cliente" onClick={guardarDatosCliente} disabled={cargando}>
                            {clienteEncontrado ? 'Actualizar datos cliente' : 'Guardar datos cliente'}
                        </button>

                        <select className="vehiculo-selector" value={vehiculoSeleccionado} onChange={(e) => {
                            const valor = e.target.value;
                            const vehiculo = vehiculosCliente.find(item => item.placa === valor);
                            aplicarVehiculo(vehiculo || 'NUEVO');
                        }}>
                            <option value="NUEVO">Registrar nuevo vehiculo</option>
                            {vehiculosCliente.map(vehiculo => (
                                <option key={vehiculo.id || vehiculo.placa} value={vehiculo.placa}>
                                    {vehiculo.placa} - {vehiculo.tipoVehiculo || vehiculo.tipo_vehiculo || 'VEHICULO'}
                                </option>
                            ))}
                        </select>

                        <input placeholder="Placa" maxLength="6" value={form.placa} onChange={(e) => actualizarCampo('placa', e.target.value.replace(/[^A-Za-z0-9]/g, ''))} required />
                        <select value={form.tipo_vehiculo} onChange={(e) => actualizarCampo('tipo_vehiculo', e.target.value)}>
                            <option value="AUTOMOVIL">Automovil</option>
                            <option value="MOTOCICLETA">Motocicleta</option>
                            <option value="PESADO">Carga pesada</option>
                        </select>
                        <input placeholder="Marca" value={form.marca} onChange={(e) => actualizarCampo('marca', e.target.value)} required />
                        <input placeholder="Color" value={form.color} onChange={(e) => actualizarCampo('color', e.target.value)} />
                        <input placeholder="Modelo" value={form.modelo} onChange={(e) => actualizarCampo('modelo', e.target.value)} />
                    </div>
                    <button disabled={cargando || !!reservaActiva}>
                        {reservaActiva ? 'Ya tiene una reserva activa' : 'Reservar cupo gratis'}
                    </button>
                    <small>Reserva gratis por 15 minutos. Una prorroga disponible: 10 minutos por $1.000.</small>
                </form>

                <section className="cliente-panel estado-panel">
                    <h2>Mi reserva</h2>
                    {vehiculoActivo ? (
                        <>
                            <div className="cupo-grande ocupado">{vehiculoActivo.lugar_asignado || vehiculoActivo.lugarAsignado}</div>
                            <p><strong>Placa:</strong> {vehiculoActivo.placa}</p>
                            <p><strong>Estado:</strong> VEHICULO EN PARQUEADERO</p>
                            <p><strong>Ingreso:</strong> {formatoFecha(vehiculoActivo.fecha_entrada || vehiculoActivo.fechaEntrada)}</p>
                            <p><strong>Tiempo:</strong> {calcularValorActual(vehiculoActivo).minutos} min</p>
                            <p><strong>Valor estimado:</strong> $ {calcularValorActual(vehiculoActivo).total.toLocaleString('es-CO')}</p>
                        </>
                    ) : reservaActiva ? (
                        <>
                            <div className="cupo-grande">{reservaActiva.lugar_asignado || reservaActiva.lugarAsignado}</div>
                            <p><strong>Placa:</strong> {reservaActiva.placa}</p>
                            <p><strong>Codigo:</strong> {reservaActiva.codigoReserva}</p>
                            <p><strong>Estado:</strong> {reservaActiva.estado}</p>
                            <p><strong>Vence:</strong> {formatoFecha(reservaActiva.vence_en || reservaActiva.venceEn)}</p>
                            <p><strong>Tiempo restante:</strong> {minutosRestantes(reservaActiva.vence_en || reservaActiva.venceEn)}</p>
                            <div className="cliente-actions">
                                <button type="button" onClick={() => imprimirTicketReserva(reservaActiva)}>Ticket / QR</button>
                                <button type="button" onClick={prorrogarReserva} disabled={cargando || Number(reservaActiva.prorrogas_usadas ?? reservaActiva.prorrogasUsadas ?? 0) >= 1}>Prorrogar $1.000</button>
                                <button type="button" className="danger" onClick={cancelarReserva}>Cancelar</button>
                            </div>
                        </>
                    ) : (
                        <p>No tiene reservas activas. Consulte su documento y reserve un cupo.</p>
                    )}
                </section>
            </section>

            <section className="cliente-panel historial-panel">
                <div className="historial-header">
                    <h2>Historial de reservas</h2>
                    <div className="historial-filtros">
                        <input type="date" value={filtroInicio} onChange={(e) => setFiltroInicio(e.target.value)} />
                        <input type="date" value={filtroFin} onChange={(e) => setFiltroFin(e.target.value)} />
                    </div>
                </div>
                {reservasFiltradas.length === 0 ? (
                    <p>No hay reservas para este cliente en el rango seleccionado.</p>
                ) : reservasFiltradas.map(reserva => (
                    <div className="reserva-row" key={reserva.id}>
                        <span>{reserva.codigoReserva}</span>
                        <span>{reserva.placa}</span>
                        <span>{reserva.lugar_asignado || reserva.lugarAsignado}</span>
                        <span>{formatoFecha(reserva.fecha_reserva || reserva.fechaReserva)}</span>
                        <strong>{reserva.estado}</strong>
                    </div>
                ))}
            </section>
        </main>
    );
};

export default PortalCliente;
