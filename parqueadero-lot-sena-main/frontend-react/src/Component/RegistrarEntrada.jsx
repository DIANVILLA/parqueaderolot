import React, { useState, useEffect } from 'react';
import './RegistrarEntrada.css';
import { apiUrl } from '../apiConfig';

const generateSpaces = (letter, count) =>
    Array.from({ length: count }, (_, index) => `${letter}${index + 1}`);

const ESPACIOS_POR_TIPO = {
    'Automóvil': generateSpaces('A', 40),
    'Motocicleta': generateSpaces('B', 40),
    'Pesado': generateSpaces('C', 40)
};

const mayuscula = (valor = '') => valor.toUpperCase();

const RegistrarEntrada = ({ vehiculos = [], setVehiculos, casillaPreasignada }) => {
    
    // ============================================================
    // 1. CRONÓMETRO DE INGRESO Y FECHA (TIEMPO REAL)
    // ============================================================
    const [fechaActual, setFechaActual] = useState(new Date().toLocaleDateString('es-CO'));
    const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString('es-CO'));

    useEffect(() => {
        const timer = setInterval(() => {
            const ahora = new Date();
            setFechaActual(ahora.toLocaleDateString('es-CO'));
            setHoraActual(ahora.toLocaleTimeString('es-CO'));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // ============================================================
    // 2. ESTADOS DEL FORMULARIO Y CONTROL DE CLIENTE
    // ============================================================
    const [placa, setPlaca] = useState('');
    const [datosIngreso, setDatosIngreso] = useState({
        propietario_nombre: '',
        propietario_cedula: '',
        propietario_telefono: '',
        tipo_vehiculo: 'Automóvil',
        marca: '', // <-- AÑADIMOS MARCA SEPARADA
        color: '', // <-- RECUPERAMOS EL COLOR
        modelo: '',
        lugar_asignado: '',
        observaciones: ''
    });

    const [clienteExisteBBDD, setClienteExisteBBDD] = useState(false);
    const [espacioAutomatico, setEspacioAutomatico] = useState(true);
    const [ultimoTicket, setUltimoTicket] = useState(null);
    const [reservaActiva, setReservaActiva] = useState(null);

    const obtenerEspacioDisponible = (tipoVehiculo, vehiculosActivos = []) => {
        const espaciosDelTipo = ESPACIOS_POR_TIPO[tipoVehiculo] || ESPACIOS_POR_TIPO['Automóvil'];
        const ocupados = new Set(
            vehiculosActivos
                .map(v => v.lugar_asignado || v.lugarAsignado)
                .filter(Boolean)
                .map(lugar => String(lugar).toUpperCase())
        );
        return espaciosDelTipo.find(espacio => !ocupados.has(espacio)) || '';
    };

    // ============================================================
    // AUTO-RELLENAR CASILLA SELECCIONADA EN EL MAPA
    // ============================================================
    useEffect(() => {
        if (casillaPreasignada) {
            setDatosIngreso(prev => ({ ...prev, lugar_asignado: casillaPreasignada }));
            setEspacioAutomatico(false);
        }
    }, [casillaPreasignada]);

    // ============================================================
    // ASIGNACIÓN AUTOMÁTICA DE CUPO SEGÚN DISPONIBILIDAD
    // ============================================================
    useEffect(() => {
        if (!espacioAutomatico || casillaPreasignada || reservaActiva) return;
        const siguienteEspacio = obtenerEspacioDisponible(datosIngreso.tipo_vehiculo, vehiculos);
        setDatosIngreso(prev => (
            prev.lugar_asignado === siguienteEspacio
                ? prev
                : { ...prev, lugar_asignado: siguienteEspacio }
        ));
    }, [datosIngreso.tipo_vehiculo, vehiculos, espacioAutomatico, casillaPreasignada, reservaActiva]);

    // ============================================================
    // 3. ESTADOS PARA GESTIÓN DINÁMICA DE MARCAS POR TIPO
    // ============================================================
    const [listasMarcas, setListasMarcas] = useState({
        'Automóvil': ["CHEVROLET", "RENAULT", "MAZDA", "TOYOTA", "KIA", "HYUNDAI", "VOLKSWAGEN", "NISSAN"],
        'Motocicleta': ["YAMAHA", "HONDA", "SUZUKI", "BAJAJ", "AKT", "KTM", "TVS", "HERO"],
        'Pesado': ["KENWORTH", "INTERNATIONAL", "FREIGHTLINER", "VOLVO", "HINO", "SCANIA", "MACK"]
    });

    const obtenerClaveTipoMarca = (tipoVehiculo = '') => {
        const tipo = mayuscula(tipoVehiculo)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        if (tipo.includes('MOTO')) return 'Motocicleta';
        if (tipo.includes('PESADO') || tipo.includes('CARGA')) return 'Pesado';
        return 'Automóvil';
    };
    
    // Filtro automático: Solo muestra las marcas del tipo seleccionado
    const tipoMarcaActual = obtenerClaveTipoMarca(datosIngreso.tipo_vehiculo);
    const marcasActuales = listasMarcas[tipoMarcaActual] || []; 
    
    const [mostrarOtraMarca, setMostrarOtraMarca] = useState(false);
    const [nuevaMarca, setNuevaMarca] = useState('');

    // ============================================================
    // 3. INTERCONEXIÓN AUTOMÁTICA CON LA BASE DE DATOS (PUERTO 8090)
    // ============================================================
    const esMarcaValida = (marca) => {
        if (!marca) return false;
        const valor = marca.trim().toLowerCase();
        return valor !== 'sin marca' && valor !== 'sin especificar';
    };

    const aplicarDatosVehiculoEncontrado = (data) => {
        setDatosIngreso(prev => ({
            ...prev,
            propietario_nombre: data.propietario_nombre || data.propietarioNombre || data.nombreCompleto || prev.propietario_nombre,
            propietario_cedula: data.propietario_cedula || data.propietarioCedula || data.identificacion || prev.propietario_cedula,
            propietario_telefono: data.propietario_telefono || data.propietarioTelefono || data.telefono || prev.propietario_telefono,
            tipo_vehiculo: obtenerClaveTipoMarca(data.tipo_vehiculo || data.tipoVehiculo || prev.tipo_vehiculo),
            marca: esMarcaValida(data.marca) ? data.marca : prev.marca,
            color: data.color || prev.color,
            modelo: data.modelo || prev.modelo
        }));
        setClienteExisteBBDD(true);
    };

    const aplicarReservaActiva = (reserva) => {
        setReservaActiva(reserva);
        setPlaca(reserva.placa || '');
        setDatosIngreso(prev => ({
            ...prev,
            propietario_nombre: reserva.cliente_nombre || reserva.clienteNombre || prev.propietario_nombre,
            propietario_cedula: reserva.cliente_cedula || reserva.clienteCedula || prev.propietario_cedula,
            propietario_telefono: reserva.cliente_telefono || reserva.clienteTelefono || prev.propietario_telefono,
            tipo_vehiculo: obtenerClaveTipoMarca(reserva.tipo_vehiculo || reserva.tipoVehiculo || prev.tipo_vehiculo),
            marca: reserva.marca || prev.marca,
            color: reserva.color || prev.color,
            modelo: reserva.modelo || prev.modelo,
            lugar_asignado: reserva.lugar_asignado || reserva.lugarAsignado || prev.lugar_asignado,
            observaciones: `RESERVA ${reserva.codigoReserva || reserva.codigo_reserva || ''}`.trim()
        }));
        setClienteExisteBBDD(true);
        setEspacioAutomatico(false);
    };

    const buscarEnHistorialRegistros = async (valorPlaca) => {
        const res = await fetch(apiUrl('/registros/listar'));
        if (!res.ok) return false;

        const registros = await res.json();
        const coincidencias = registros
            .filter(item => (item.placa || '').toUpperCase() === valorPlaca)
            .sort((a, b) => new Date(b.fecha_entrada || b.fechaEntrada || 0) - new Date(a.fecha_entrada || a.fechaEntrada || 0));

        if (coincidencias.length > 0) {
            aplicarDatosVehiculoEncontrado(coincidencias[0]);
            return true;
        }

        return false;
    };
    
    // MEJORA 1: Búsqueda y Auto-relleno por PLACA
    const buscarPorPlaca = async (valorPlaca) => {
        if (valorPlaca.length === 6) {
            try {
                const activos = await fetch(apiUrl('/registros/activos'));
                if (activos.ok) {
                    const registrosActivos = await activos.json();
                    const activo = registrosActivos.find(item => (item.placa || '').toUpperCase() === valorPlaca);
                    if (activo) {
                        aplicarDatosVehiculoEncontrado(activo);
                        alert(`El vehículo con placa ${valorPlaca} ya está dentro en el cupo ${activo.lugar_asignado || activo.lugarAsignado || 'asignado'}. Para liquidarlo use Registrar Salida.`);
                        return;
                    }
                }

                const reservaActivaResponse = await fetch(apiUrl(`/reservas/placa/${valorPlaca}/activa`));
                if (reservaActivaResponse.ok) {
                    const reserva = await reservaActivaResponse.json();
                    aplicarReservaActiva(reserva);
                    alert(`Reserva activa encontrada. Cupo reservado: ${reserva.lugar_asignado || reserva.lugarAsignado}. Confirme el ingreso cuando el vehiculo este fisicamente en el parqueadero.`);
                    return;
                }

                const respuesta = await fetch(apiUrl(`/vehiculos/buscar/${valorPlaca}`));
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    aplicarDatosVehiculoEncontrado(data);
                } else {
                    const encontradoEnHistorial = await buscarEnHistorialRegistros(valorPlaca);
                    setClienteExisteBBDD(encontradoEnHistorial);
                }
            } catch (error) {
                setClienteExisteBBDD(false);
            }
        }
    };

    // MEJORA 1 (Adicional): Búsqueda automática por CÉDULA
    const buscarClientePorCedula = async (cedula) => {
        if (cedula.length >= 5) {
            try {
                const res = await fetch(apiUrl(`/clientes/buscar/${cedula}`));
                if (res.ok) {
                    const data = await res.json();
                    
                    setDatosIngreso(prev => ({
                        ...prev,
                        // Si en la consola ves que el campo se llama 'nombreCompleto' y no 'nombre', cámbialo aquí
                        propietario_nombre: data.nombre || data.nombreCompleto || prev.propietario_nombre,
                        propietario_telefono: data.telefono || prev.propietario_telefono
                    }));
                    setClienteExisteBBDD(true);
                } else {
                    setClienteExisteBBDD(false);
                }
            } catch (e) {
            }
        }
    };

    // ============================================================
    // 4. VALIDACIONES ESTRICTAS
    // ============================================================
    const handleNombreChange = (e) => {
        const soloLetras = mayuscula(e.target.value.replace(/[^A-Za-zñÑáéíóúÁÉÍÓÚ\s]/g, ''));
        setDatosIngreso({ ...datosIngreso, propietario_nombre: soloLetras });
    };

    const agregarNuevaMarca = () => {
        const tipo = obtenerClaveTipoMarca(datosIngreso.tipo_vehiculo); 
        const marcasDelTipo = listasMarcas[tipo] || [];
        const marcaNormalizada = mayuscula(nuevaMarca.trim());
        if (marcaNormalizada && !marcasDelTipo.includes(marcaNormalizada)) {
            setListasMarcas({
                ...listasMarcas,
                [tipo]: [...marcasDelTipo, marcaNormalizada] // La guarda en su categoría
            });
            setDatosIngreso({...datosIngreso, marca: marcaNormalizada});
            setMostrarOtraMarca(false);
            setNuevaMarca('');
        } else if (marcaNormalizada) {
            setDatosIngreso({...datosIngreso, marca: marcaNormalizada});
            setMostrarOtraMarca(false);
            setNuevaMarca('');
        }
    };
    const handleNumeroChange = (key, value) => {
        const soloNumeros = value.replace(/[^0-9]/g, '');
        setDatosIngreso(prev => ({ ...prev, [key]: soloNumeros }));
        if (key === 'propietario_cedula' && soloNumeros.length >= 5) {
            buscarClientePorCedula(soloNumeros);
        }
    };

    const handlePlacaChange = (e) => {
        const valor = mayuscula(e.target.value).replace(/[^A-Z0-9]/g, '');
        setPlaca(valor);
        buscarPorPlaca(valor);
    };

    useEffect(() => {
        const parametros = new URLSearchParams(window.location.search);
        const codigoReserva = parametros.get('reserva');
        if (!codigoReserva) return;

        const cargarReservaPorQr = async () => {
            try {
                const res = await fetch(apiUrl(`/reservas/codigo/${encodeURIComponent(codigoReserva)}`));
                if (res.ok) {
                    const reserva = await res.json();
                    aplicarReservaActiva(reserva);
                }
            } catch (error) {
                console.error("No se pudo cargar la reserva del QR:", error);
            }
        };

        cargarReservaPorQr();
    }, []);

    const handleLugarChange = (e) => {
        if (reservaActiva) {
            return alert("Este cupo viene de una reserva activa y no debe modificarse.");
        }
        let val = mayuscula(e.target.value);
        if (val.length === 1 && !/[A-Z]/.test(val)) return; 
        if (val.length > 1 && !/^[A-Z][0-9]{0,2}$/.test(val)) return;
        setEspacioAutomatico(false);
        setDatosIngreso({ ...datosIngreso, lugar_asignado: val });
    };

    const reasignarAutomaticamente = () => {
        if (reservaActiva) {
            return alert("Este vehículo tiene una reserva activa. El cupo reservado no debe cambiarse desde ingreso.");
        }
        const siguienteEspacio = obtenerEspacioDisponible(datosIngreso.tipo_vehiculo, vehiculos);
        setEspacioAutomatico(true);
        setDatosIngreso(prev => ({ ...prev, lugar_asignado: siguienteEspacio }));
    };


  
// ============================================================
// ÓGICA DE REGISTRO INTEGRADA (EL TICKET DE COBRO)
// ============================================================
const ejecutarIngreso = async () => {
    // 1. Validaciones básicas
    const camposFaltantes = [];
    if (!placa) camposFaltantes.push("placa");
    if (!datosIngreso.propietario_cedula) camposFaltantes.push("cedula del cliente");
    if (!datosIngreso.lugar_asignado) camposFaltantes.push("asignacion de espacio");
    if (!esMarcaValida(datosIngreso.marca)) camposFaltantes.push("marca del vehiculo");

    if (camposFaltantes.length > 0) {
        return alert(`Faltan datos obligatorios: ${camposFaltantes.join(", ")}.`);
    }

    // 2. CONSTRUCCIÓN EXACTA
    const payloadRegistro = {
        placa: placa,
        tipo_vehiculo: datosIngreso.tipo_vehiculo,
        modelo: datosIngreso.modelo || "2026",
        marca: datosIngreso.marca,
        color: datosIngreso.color || "Sin especificar",
        propietario_nombre: datosIngreso.propietario_nombre,
        propietario_cedula: datosIngreso.propietario_cedula,
        propietario_telefono: datosIngreso.propietario_telefono,
        lugar_asignado: datosIngreso.lugar_asignado,
        observaciones: datosIngreso.observaciones
    };

    try {
        const resTicket = reservaActiva
            ? await fetch(apiUrl(`/reservas/${reservaActiva.id}/confirmar-ingreso`), { method: 'PUT' })
            : await fetch(apiUrl('/registros'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadRegistro)
            });

        if (resTicket.ok) {
            const registroGuardado = await resTicket.json();
            const ticketGenerado = {
                ...payloadRegistro,
                ...registroGuardado,
                marca: registroGuardado.marca || payloadRegistro.marca,
                fecha_entrada: registroGuardado.fecha_entrada || registroGuardado.fechaEntrada || new Date().toISOString()
            };
            setUltimoTicket(ticketGenerado);
            alert(reservaActiva ? "RESERVA CONFIRMADA: ingreso registrado y cupo ocupado." : "INGRESO EXITOSO: Datos guardados correctamente.");
            
            // 3. SINCRONIZACIÓN AUTOMÁTICA
            // Esta llamada obliga a MenuPrincipal a refrescar la lista de vehículos
            // y, por ende, el mapa cambiará a 'ocupado' (rojo neón) instantáneamente.
            const resLista = await fetch(apiUrl('/registros/activos'));
            if (resLista.ok) {
                const listaActualizada = await resLista.json();
                setVehiculos(listaActualizada);
            }

            // CU-OPER-01: Despues de registrar la entrada, el operario decide si imprime el ticket con QR para caja.
            if (window.confirm("¿Desea imprimir el ticket de ingreso con código QR para caja?")) {
                imprimirTicket(ticketGenerado);
            }
            
            // Limpieza
            setPlaca('');
            setDatosIngreso({ 
                propietario_nombre: '', propietario_cedula: '', propietario_telefono: '', 
                tipo_vehiculo: 'Automóvil', marca: '', color: '', modelo: '', lugar_asignado: '', observaciones: '' 
            });
            setEspacioAutomatico(true);
            setReservaActiva(null);
        } else {
            const errorText = await resTicket.text();
            alert("Error: " + errorText);
        }
    } catch (error) {
        alert("No se pudo conectar con el backend. Verifique que Spring Boot, MySQL y la URL REACT_APP_API_URL estén activos.");
    }
};
    /* ============================================================
    FIN: LÓGICA DE REGISTRO E INTEGRACIÓN CON EL MAPA
    ============================================================= */

    // ============================================================
    // BOTÓN DE IMPRIMIR
    // ============================================================//

    const construirTicketActual = () => ({
        placa,
        tipo_vehiculo: datosIngreso.tipo_vehiculo,
        propietario_nombre: datosIngreso.propietario_nombre,
        propietario_cedula: datosIngreso.propietario_cedula,
        propietario_telefono: datosIngreso.propietario_telefono,
        marca: datosIngreso.marca,
        color: datosIngreso.color,
        modelo: datosIngreso.modelo,
        lugar_asignado: datosIngreso.lugar_asignado,
        fecha_entrada: new Date().toISOString()
    });

    const imprimirTicket = (ticket = ultimoTicket || construirTicketActual()) => {
        if (!ticket?.placa || !ticket?.lugar_asignado) {
            return alert("Primero registre el vehículo o complete placa y cupo para generar el ticket.");
        }

        const fechaEntrada = ticket.fecha_entrada || ticket.fechaEntrada || new Date().toISOString();
        const urlSalida = `${window.location.origin}/salida?placa=${encodeURIComponent(ticket.placa)}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(urlSalida)}`;
        const ventanaImpresion = window.open('', '_blank', 'width=380,height=620');
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Ticket de Parqueadero</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 18px; text-align: center; }
                        .ticket { max-width: 300px; margin: 0 auto; }
                        h2 { margin: 0 0 6px; }
                        p { margin: 6px 0; font-size: 13px; }
                        .placa { font-size: 28px; font-weight: 900; letter-spacing: 5px; margin: 10px 0; }
                        .linea { border-top: 1px dashed #333; margin: 12px 0; }
                        .qr { margin: 12px auto 6px; width: 170px; height: 170px; }
                        .nota { font-size: 11px; color: #333; }
                        .detalle { text-align: left; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                    <h2>PARQUEADERO LOT</h2>
                    <p>Ticket de ingreso</p>
                    <hr>
                    <div class="placa">${ticket.placa}</div>
                    <div class="detalle">
                        <p><strong>Cupo:</strong> ${ticket.lugar_asignado}</p>
                        <p><strong>Vehículo:</strong> ${ticket.tipo_vehiculo || 'Sin especificar'}</p>
                        <p><strong>Marca:</strong> ${ticket.marca || 'Sin especificar'}</p>
                        <p><strong>Color:</strong> ${ticket.color || 'Sin especificar'}</p>
                        <p><strong>Modelo:</strong> ${ticket.modelo || 'Sin especificar'}</p>
                        <p><strong>Cliente:</strong> ${ticket.propietario_nombre || 'Sin especificar'}</p>
                        <p><strong>Cédula:</strong> ${ticket.propietario_cedula || 'Sin especificar'}</p>
                        <p><strong>Ingreso:</strong> ${new Date(fechaEntrada).toLocaleString('es-CO')}</p>
                    </div>
                    <div class="linea"></div>
                    <img class="qr" src="${qrUrl}" alt="QR para liquidar salida" />
                    <p class="nota">Caja: escanee este QR para abrir la liquidación de la placa.</p>
                    <p class="nota">${urlSalida}</p>
                    <div class="linea"></div>
                    <p>Conserve este ticket.</p>
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() { window.print(); }, 400);
                        };
                    </script>
                </body>
            </html>
        `);
        ventanaImpresion.document.close();
    };

    return (
        <div className="admision-lot-wrapper">
            <header className="lot-header-bar">
                <div className="lot-title-box">
                    <h2>01. GESTIÓN DE <span className="green-neon">ADMISIÓN</span></h2>
                </div>
                <div className="lot-clock-box">
                    <p className="label-clock">REGISTRO DE TIEMPO REAL</p>
                    <div className="live-datetime">
                        <span>{fechaActual}</span>
                        <span className="time-highlight">{horaActual}</span>
                    </div>
                </div>
            </header>

            <div className="lot-vertical-layout">
                <section className="lot-cctv-top">
                    <div className="cctv-grid-horizontal">
                        <div className="cctv-cam"><span>CAM 01 - FRONTAL</span></div>
                        <div className="cctv-cam"><span>CAM 02 - TRASERA</span></div>
                        <div className="cctv-cam"><span>CAM 03 - IZQUIERDA</span></div>
                        <div className="cctv-cam"><span>CAM 04 - DERECHA</span></div>
                    </div>
                </section>

                <main className="lot-form-panel">
                    <div className="lot-form-grid">
                        <div className="lot-field full">
                            <label>IDENTIFICACIÓN PLACA </label>
                            <input type="text" className="lot-input-placa" value={placa} onChange={handlePlacaChange} maxLength={6} placeholder="EJ: ABC123" />
                        </div>
                        <div className="lot-field">
                            <label>CÉDULA DE CIUDADANÍA </label>
                            <input type="text" className="lot-input" value={datosIngreso.propietario_cedula} onChange={(e) => handleNumeroChange('propietario_cedula', e.target.value)} placeholder="Escriba la cédula" />
                        </div>
                        <div className="lot-field">
                            <label>NOMBRES Y APELLIDOS </label>
                            <input type="text" className="lot-input" value={datosIngreso.propietario_nombre} onChange={handleNombreChange} readOnly={clienteExisteBBDD} />
                        </div>
                        <div className="lot-field">
                            <label>TELÉFONO CONTACTO </label>
                            <input type="text" className="lot-input" value={datosIngreso.propietario_telefono} onChange={(e) => handleNumeroChange('propietario_telefono', e.target.value)} readOnly={clienteExisteBBDD} />
                        </div>
                        
                        <div className="lot-field">
                            <label>TIPO DE VEHÍCULO</label>
                            <select
                                className="lot-input"
                                value={tipoMarcaActual}
                                onChange={(e) => {
                                    setDatosIngreso({...datosIngreso, tipo_vehiculo: e.target.value, marca: ''});
                                    setMostrarOtraMarca(false);
                                    setNuevaMarca('');
                                }}
                            >
                                <option value="Automóvil">Automóvil</option>
                                <option value="Motocicleta">Motocicleta</option>
                                <option value="Pesado">Vehículo Pesado</option>
                            </select>
                        </div>
                        <div className="lot-field">
                            <label>ASIGNACIÓN DE ESPACIO </label>
                            <div className="spot-auto-group">
                                <input
                                    type="text"
                                    className="lot-input spot-small"
                                    value={datosIngreso.lugar_asignado}
                                    onChange={handleLugarChange}
                                    maxLength={3}
                                    placeholder="Sin cupo"
                                    readOnly={espacioAutomatico}
                                    title={espacioAutomatico ? 'Asignado automaticamente segun cupo disponible' : 'Asignacion manual'}
                                />
                                <button type="button" className="btn-auto-space" onClick={reasignarAutomaticamente}>
                                    <i className="pi pi-refresh icon-inline" /> Auto
                                </button>
                            </div>
                            <small className="spot-help">
                                {datosIngreso.lugar_asignado
                                    ? `Cupo ${espacioAutomatico ? 'asignado automaticamente' : 'seleccionado manualmente'}`
                                    : 'No hay cupos disponibles para este tipo de vehiculo'}
                            </small>
                        </div>

                        {/* ============================================================
                        SELECTOR DE MARCAS INTEGRADO CORRECTAMENTE
                        ============================================================ */}
                        {/* SELECTOR DE MARCAS DINÁMICO */}
                        <div className="lot-field">
                            <label>MARCA DEL VEHÍCULO</label>
                            <select 
                                className="lot-input" 
                                value={datosIngreso.marca} 
                                onChange={(e) => {
                                    if (e.target.value === "Otra") {
                                        setMostrarOtraMarca(true);
                                    } else {
                                        setMostrarOtraMarca(false);
                                        setDatosIngreso({...datosIngreso, marca: mayuscula(e.target.value)});
                                    }
                                }}
                            >
                                <option value="">Seleccione marca...</option>
                                {/* Pinta solo las marcas del tipo de vehículo actual */}
                                {marcasActuales.map((marca, index) => (
                                    <option key={index} value={marca}>{marca}</option>
                                ))}
                                <option value="Otra">Otra (Registrar nuevo)</option>
                            </select>
                        </div>

                        {mostrarOtraMarca && (
                            <div className="lot-field full">
                                <label>ESCRIBA LA NUEVA MARCA</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        className="lot-input" 
                                        value={nuevaMarca}
                                        onChange={(e) => setNuevaMarca(mayuscula(e.target.value))} 
                                        placeholder="Escriba aquí..."
                                    />
                                    <button type="button" className="lot-btn-pill" onClick={agregarNuevaMarca}>AGREGAR</button>
                                </div>
                            </div>
                        )}

                        {/* EL CAMPO DE COLOR */}
                        <div className="lot-field">
                            <label>COLOR</label>
                            <input 
                                type="text" 
                                className="lot-input" 
                                value={datosIngreso.color} 
                                onChange={(e) => setDatosIngreso({...datosIngreso, color: mayuscula(e.target.value)})} 
                                placeholder="Ej: Negro" 
                            />  
                        </div>

                        <div className="lot-field">
                            <label>MODELO (AÑO)</label>
                            <input 
                                type="number" 
                                className="lot-input" 
                                value={datosIngreso.modelo} 
                                onChange={(e) => setDatosIngreso({...datosIngreso, modelo: mayuscula(e.target.value)})} 
                                placeholder="Ej: 2025" 
                            />  
                        </div>

                        {/* ====================================
                        tabla de comportamiento de campos:
                        ====================================== */}

                        <div className="lot-field full">
                            <label>OBSERVACIONES TÉCNICAS </label>
                            <textarea className="lot-textarea" value={datosIngreso.observaciones} onChange={(e) => setDatosIngreso({...datosIngreso, observaciones: mayuscula(e.target.value)})} />
                        </div>
                    </div>

                    {reservaActiva && (
                        <div className="reserva-operario-banner">
                            <strong>RESERVA ACTIVA:</strong> {reservaActiva.codigoReserva} · Cupo {reservaActiva.lugar_asignado || reservaActiva.lugarAsignado} · Vence {new Date(reservaActiva.vence_en || reservaActiva.venceEn).toLocaleTimeString('es-CO')}
                        </div>
                    )}

                    {/* ====================================
                    boton de ingresarte con toda la lógica integrada:
                    ====================================== */}
<div className="lot-action-area" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
    <button className="lot-btn-pill" onClick={ejecutarIngreso}>
        {reservaActiva ? 'CONFIRMAR INGRESO DE RESERVA' : 'INGRESAR VEHÍCULO'}
    </button>
    
    {/* NUEVO BOTÓN DE IMPRIMIR */}
    <button 
        className="lot-btn-pill" 
        style={{ backgroundColor: '#ffcc00', color: '#000' }} 
        onClick={imprimirTicket}
    >
        <i className="pi pi-print icon-inline" /> IMPRIMIR TICKET
    </button>
</div>


                    
                </main>
            </div>
        </div>
    );
};

export default RegistrarEntrada;
