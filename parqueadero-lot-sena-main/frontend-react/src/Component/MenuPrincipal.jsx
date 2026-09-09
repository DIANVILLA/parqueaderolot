/* ============================================================
   INICIO: IMPORTACIONES
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { Chart } from 'primereact/chart';
import './MenuPrincipal.css';
import ReporteDiario from './ReporteDiario';
import AdminPanel from './AdminPanel';
import { apiUrl } from '../apiConfig';
/* ============================================================
   FIN: IMPORTACIONES
   ============================================================ */

/* ============================================================
   INICIO: COMPONENTES IMPORTADOS DE OPERACIONES
   ============================================================ */
import RegistrarEntrada from './RegistrarEntrada'; 
import RegistrarSalida from './RegistrarSalida'; 
import AsiganarEspacioManual from './AsiganarEspacioManual'; 
import EstadoOcupacion from './EstadoOcupacion'; 
/* ============================================================
   FIN: COMPONENTES IMPORTADOS DE OPERACIONES
   ============================================================ */

/* ============================================================
   INICIO: DEFINICIÓN DE ESTRUCTURA DE PARQUEADERO
   ============================================================ */
const generateSpaces = (letter, count) =>
  Array.from({ length: count }, (_, index) => `${letter}${index + 1}`);

const PARKING_SPACES = {
  A: { fila: 'A', tipo: 'AUTOMÓVIL', espacios: generateSpaces('A', 40) },
  B: { fila: 'B', tipo: 'MOTOCICLETA', espacios: generateSpaces('B', 40) },
  C: { fila: 'C', tipo: 'CARGA_PESADA', espacios: generateSpaces('C', 40) }
};
/* ============================================================
   FIN: DEFINICIÓN DE ESTRUCTURA DE PARQUEADERO
   ============================================================ */

/* ============================================================
   INICIO: COMPONENTE PRINCIPAL
   ============================================================ */
const MenuPrincipal = ({ pantalla, vehiculos = [], setVehiculos, usuario }) => {
    const navigate = useNavigate(); 
    const location = useLocation();
    const modoDesarrollo = !usuario;
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

    const formatTime = () => new Date().toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
    });

    const calcularTiempoEnPatio = (fechaEntrada) => {
        if (!fechaEntrada) return '';
        const entrada = new Date(fechaEntrada);
        if (Number.isNaN(entrada.getTime())) return '';
        const minutosTotales = Math.max(0, Math.floor((Date.now() - entrada.getTime()) / 60000));
        const horas = Math.floor(minutosTotales / 60);
        const minutos = minutosTotales % 60;
        return horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`;
    };

    const normalizarTipoVehiculo = (tipoVehiculo = '') => {
        const tipo = tipoVehiculo
            .toString()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        if (tipo.includes('MOTO')) return 'MOTOCICLETA';
        if (tipo.includes('PESADO') || tipo.includes('CARGA')) return 'PESADO';
        return 'AUTOMOVIL';
    };

    const formatoPesos = (valor) =>
        Number(valor || 0).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        });

    /* ============================================================
       INICIO: RELOJ DIGITAL EN TIEMPO REAL
       ============================================================ */
    const [hora, setHora] = useState(formatTime());
    useEffect(() => {
    const timer = setInterval(() => setHora(formatTime()), 1000);
        return () => clearInterval(timer); 
    }, []);
    /* ============================================================
       FIN: RELOJ DIGITAL EN TIEMPO REAL
       ============================================================ */

    /* ============================================================
       INICIO: GESTIÓN DE ESTADO DE ESPACIOS
       ============================================================ */
    const [espacios, setEspacios] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
    const [tarifas, setTarifas] = useState([]);
    const [reservasActivas, setReservasActivas] = useState([]);

    /* ============================================================
       INICIO: CU-ADM-04 CONSULTA DE TARIFAS PARA VALOR EN MAPA
       ============================================================ */
    const cargarTarifas = async () => {
        try {
            const res = await fetch(apiUrl('/admin/tarifas'));
            if (res.ok) {
                const data = await res.json();
                setTarifas(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error al cargar tarifas:', error);
        }
    };

    const obtenerTarifaPorTipo = (tipoVehiculo) => {
        const tipoNormalizado = normalizarTipoVehiculo(tipoVehiculo);
        const tarifa = tarifas.find(item => normalizarTipoVehiculo(item.tipoVehiculo) === tipoNormalizado);
        const tarifasBase = { AUTOMOVIL: 50, MOTOCICLETA: 30, PESADO: 70 };
        return Number(tarifa?.valorPorMinuto || tarifasBase[tipoNormalizado] || 0);
    };

    const calcularValorEstimado = (fechaEntrada, tipoVehiculo) => {
        if (!fechaEntrada) return 0;
        const entrada = new Date(fechaEntrada);
        if (Number.isNaN(entrada.getTime())) return 0;
        const minutosTotales = Math.max(1, Math.floor((Date.now() - entrada.getTime()) / 60000));
        return minutosTotales * obtenerTarifaPorTipo(tipoVehiculo);
    };

    useEffect(() => {
        cargarTarifas();
    }, []);
    /* ============================================================
       FIN: CU-ADM-04 CONSULTA DE TARIFAS PARA VALOR EN MAPA
       ============================================================ */

    const cargarVehiculosIniciales = async () => {
        try {
            const res = await fetch(apiUrl('/registros/activos'));
            if (res.ok) {
                const data = await res.json();
                setVehiculos(data); 
            }
            const reservasRes = await fetch(apiUrl('/reservas/activas'));
            if (reservasRes.ok) {
                const dataReservas = await reservasRes.json();
                setReservasActivas(Array.isArray(dataReservas) ? dataReservas : []);
            }
        } catch (error) {
            console.error("Error al sincronizar con BD:", error);
        }
    };

    useEffect(() => {
        const estadoInicial = {};
        Object.values(PARKING_SPACES).forEach(fila => {
            fila.espacios.forEach(id => {
                estadoInicial[id] = { id, estado: 'disponible', cliente: null, placa: null, tipoVehiculo: fila.tipo };
            });
        });
        setEspacios(estadoInicial);
        cargarVehiculosIniciales();
    }, []);

    useEffect(() => {
        setEspacios(prev => {
            const nuevo = Object.fromEntries(
                Object.entries(prev).map(([id, espacio]) => [
                    id, { ...espacio, estado: 'disponible', cliente: null, placa: null }
                ])
            );

            if (vehiculos && vehiculos.length > 0) {
                vehiculos.forEach(v => {
                    const lugar = v.lugar_asignado; 
                    if (lugar && nuevo[lugar]) {
                        nuevo[lugar] = {
                            ...nuevo[lugar],
                            estado: 'ocupado', 
                            vehiculo: v.tipo_vehiculo || 'Vehículo',
                            placa: v.placa,
                            cliente: v.propietario_nombre || null,
                            fechaEntrada: v.fecha_entrada || v.fechaEntrada || null
                        };
                    }
                });
            }

            if (reservasActivas && reservasActivas.length > 0) {
                reservasActivas.forEach(reserva => {
                    const lugar = reserva.lugar_asignado || reserva.lugarAsignado;
                    if (lugar && nuevo[lugar] && nuevo[lugar].estado === 'disponible') {
                        nuevo[lugar] = {
                            ...nuevo[lugar],
                            estado: 'reservado',
                            placa: reserva.placa,
                            cliente: reserva.cliente_nombre || reserva.clienteNombre || null,
                            fechaReserva: reserva.fecha_reserva || reserva.fechaReserva,
                            venceEn: reserva.vence_en || reserva.venceEn
                        };
                    }
                });
            }
            return nuevo;
        });
    }, [vehiculos, reservasActivas]);
    /* ============================================================
       FIN: GESTIÓN DE ESTADO DE ESPACIOS
       ============================================================ */

    /* ============================================================
       INICIO: DATOS PARA LA GRÁFICA DE OCUPACIÓN
       ============================================================ */
    const totalSpaces = Object.values(espacios).length;
    const occupiedByType = {
        AUTOMÓVIL: Object.values(espacios).filter(e => e.tipoVehiculo === 'AUTOMÓVIL' && e.estado === 'ocupado').length,
        MOTOCICLETA: Object.values(espacios).filter(e => e.tipoVehiculo === 'MOTOCICLETA' && e.estado === 'ocupado').length,
        CARGA_PESADA: Object.values(espacios).filter(e => e.tipoVehiculo === 'CARGA_PESADA' && e.estado === 'ocupado').length
    };
    const freeByType = {
        AUTOMÓVIL: Object.values(espacios).filter(e => e.tipoVehiculo === 'AUTOMÓVIL' && e.estado === 'disponible').length,
        MOTOCICLETA: Object.values(espacios).filter(e => e.tipoVehiculo === 'MOTOCICLETA' && e.estado === 'disponible').length,
        CARGA_PESADA: Object.values(espacios).filter(e => e.tipoVehiculo === 'CARGA_PESADA' && e.estado === 'disponible').length
    };

    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const ocupados = Object.values(espacios).filter(e => e.estado === 'ocupado').length;
        const libres = Object.values(espacios).filter(e => e.estado === 'disponible').length;
        const reservados = Object.values(espacios).filter(e => e.estado === 'reservado').length;

        const occupancyRatio = totalSpaces > 0 ? ocupados / totalSpaces : 0;
        const occupiedColor = `rgb(${Math.round(128 - 128 * occupancyRatio)}, ${Math.round(128 + 127 * occupancyRatio)}, ${Math.round(128 - 128 * occupancyRatio)})`;

        const data = {
            labels: ['Ocupados', 'Libres', 'Reservados'], 
            datasets: [{
                data: [ocupados, libres, reservados], 
                backgroundColor: [occupiedColor, '#666666', '#aaaaaa'],
                hoverBackgroundColor: [occupiedColor, '#777777', '#bbbbbb'],
                borderColor: '#050505' 
            }]
        };
        const options = {
            cutout: '70%',
            plugins: { legend: { display: false } },
            maintainAspectRatio: false
        };
        
        setChartData(data); 
        setChartOptions(options); 
    }, [espacios, totalSpaces]);
    /* ============================================================
       FIN: DATOS PARA LA GRÁFICA DE OCUPACIÓN
       ============================================================ */

    /* ============================================================
       INICIO: MANEJADORES DE ESPACIOS
       ============================================================ */
    const asignarEspacio = (espacioId) => {
        navigate('/entrada', { 
            state: { 
                espacioPreseleccionado: espacioId, 
                tipoVehiculo: espacios[espacioId]?.tipoVehiculo 
            } 
        });
    };

    const manejarClickEspacio = (espacioId) => {
        const espacio = espacios[espacioId];
        if (espacio.estado === 'disponible') {
            setEspacioSeleccionado({
                id: espacioId,
                tipo: espacio.tipoVehiculo,
                fila: espacioId.charAt(0) 
            });
            setModalVisible(true);
        } else if (espacio.estado === 'ocupado') {
            alert(`Espacio ${espacioId} ocupado por:\n${espacio.placa}\nCliente: ${espacio.cliente}`);
        } else if (espacio.estado === 'reservado') {
            alert(`Espacio ${espacioId} está RESERVADO`);
        }
    };

    const confirmarAsignacion = (opcion) => {
        if (opcion === 'automatica') {
            asignarEspacio(espacioSeleccionado.id);
        } else if (opcion === 'manual') {
            navigate('/entrada', { 
                state: { 
                    espacioPreseleccionado: espacioSeleccionado.id,
                    tipoVehiculo: espacioSeleccionado.tipo,
                    requiresConfirmation: true 
                } 
            });
        }
        setModalVisible(false);
        setEspacioSeleccionado(null);
    };
    /* ============================================================
       FIN: MANEJADORES DE ESPACIOS
       ============================================================ */

    /* ============================================================
       INICIO: RENDERIZADO DE LA INTERFAZ
       ============================================================ */
    return (
        <div className="layout-lot">
            <header className="mobile-topbar">
                <h2 className="mobile-logo">PARQUEADERO <span className="highlight">LOT</span></h2>
                <button
                    type="button"
                    className="mobile-menu-btn"
                    aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
                    onClick={() => setMenuMovilAbierto(prev => !prev)}
                >
                    <i className={`pi ${menuMovilAbierto ? 'pi-times' : 'pi-bars'}`} />
                </button>
            </header>

            {menuMovilAbierto && (
                <button
                    type="button"
                    className="mobile-menu-backdrop"
                    aria-label="Cerrar menú"
                    onClick={() => setMenuMovilAbierto(false)}
                />
            )}

            <aside className={`sidebar-lot ${menuMovilAbierto ? 'open' : ''}`}>
                <h2 className="logo-text">PARQUEADERO <span className="highlight">LOT</span></h2>
                <nav className="sidebar-nav" onClick={() => setMenuMovilAbierto(false)}>
                    <p className="group-title">MONITOREO</p>
                    <div className="menu-group single">
                        <NavLink to="/menu" className="nav-btn">Panel Principal</NavLink>
                    </div>

                    <p className="group-title">OPERACIONES</p>
                    <div className="menu-group">
                        <NavLink to="/entrada" className="nav-btn">Registrar Entrada</NavLink>
                        <NavLink to="/salida" className="nav-btn">Registrar Salida</NavLink>
                    </div>

                    <p className="group-title">GESTIÓN</p>
                    <div className="menu-group">
                        <NavLink to="/ocupacion" className="nav-btn">Estado de Ocupación</NavLink>
                    </div>
    {/* ============================================================
   INICIO: LÓGICA DE ACCESO RESTRINGIDO
   ============================================================ */}
<p className="group-title">INFORMES</p>
<div className="menu-group">
    {/* Lista de correos autorizados como administradores */}
    {(() => {
        const admins = ["Admin1231@parqueaderolot.co", "Admin1232@parqueaderolot.co"];
        const esAdmin = modoDesarrollo || (usuario && (usuario.rol === 'ADMINISTRADOR' || usuario.rol === 'GERENTE' || admins.includes(usuario.correo)));
        
        return esAdmin ? (
            <NavLink to="/reporte-diario" className="nav-btn">
                Reporte Diario
            </NavLink>
        ) : (
            <div className="nav-btn deshabilitado" style={{ cursor: 'not-allowed', color: '#444', borderColor: '#222' }} title="Acceso exclusivo para Admin o Gerente">
                <i className="pi pi-lock icon-inline" /> Reporte Diario
            </div>
        );
    })()}
</div>

{/* CU-ADM-01/CU-ADM-02: Acceso al modulo administrador solo para roles autorizados */}
<p className="group-title">ADMINISTRACION</p>
<div className="menu-group">
    {(() => {
        const admins = ["Admin1231@parqueaderolot.co", "Admin1232@parqueaderolot.co"];
        const esAdmin = modoDesarrollo || (usuario && (usuario.rol === 'ADMINISTRADOR' || admins.includes(usuario.correo)));
        return esAdmin ? (
            <NavLink to="/admin" className="nav-btn">
                Panel Administrador
            </NavLink>
        ) : (
            <div className="nav-btn deshabilitado" style={{ cursor: 'not-allowed', color: '#444', borderColor: '#222' }} title="Acceso exclusivo para Administrador">
                Panel Administrador
            </div>
        );
    })()}
</div>
{/* ============================================================
   FIN: LÓGICA DE ACCESO RESTRINGIDO
   ============================================================ */}

                    <button className="logout-btn" onClick={() => navigate('/login')} style={{ marginTop: 'auto' }}>
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>

            <main className="main-content-lot">
                {pantalla === "inicio" && (
                    <div className="dashboard">
                        <div style={{ position: 'absolute', top: '10px', right: '40px', fontSize: '1.2rem' }} className="highlight">
                            {hora}
                        </div>
                        <div className="recent-activity">
                        <h3 className="group-title">Resumen de Actividad</h3>
                        <p>Vehículos en el parqueadero: <span className="highlight">{vehiculos.length}</span></p>
                        </div>

                        <div className="summary-cards">
                            <div className="card">
                                <h3><i className="pi pi-car icon-inline" /> Automóviles</h3>
                                <p className="card-value">
                                    {occupiedByType.AUTOMÓVIL} <span style={{ fontSize: '1.2rem', color: '#888' }}>Ocupados</span>
                                </p>
                                <p className="card-mini-text highlight">Disponibles: {freeByType.AUTOMÓVIL}</p>
                            </div>

                            <div className="card">
                                <h3><i className="pi pi-send icon-inline" /> Motocicletas</h3>
                                <p className="card-value">
                                    {occupiedByType.MOTOCICLETA} <span style={{ fontSize: '1.2rem', color: '#888' }}>Ocupados</span>
                                </p>
                                <p className="card-mini-text highlight">Disponibles: {freeByType.MOTOCICLETA}</p>
                            </div>

                            <div className="card">
                                <h3><i className="pi pi-truck icon-inline" /> Carga Pesada</h3>
                                <p className="card-value">
                                    {occupiedByType.CARGA_PESADA} <span style={{ fontSize: '1.2rem', color: '#888' }}>Ocupados</span>
                                </p>
                                <p className="card-mini-text highlight">Disponibles: {freeByType.CARGA_PESADA}</p>
                            </div>
                        </div>
                        
                        <h2 className="section-title">Mapa de Ocupación</h2>
                        
                        <div className="parking-section">
                            <div className="section-header">
                                <h3 className="section-type"><i className="pi pi-car icon-inline" /> AUTOMÓVILES</h3>
                            </div>
                            <div className="parking-grid-section">
                                {Object.entries(PARKING_SPACES).filter(([_, fila]) => fila.tipo === 'AUTOMÓVIL').map(([filaKey, fila]) => (
                                    <div key={filaKey} style={{ display: 'contents' }}>
                                        {fila.espacios.map(espacioId => {
                                            const espacio = espacios[espacioId];
                                            const estado = espacio?.estado || 'disponible';
                                            return (
                                                <div key={espacioId} className={`spot spot-${estado}`} onClick={() => manejarClickEspacio(espacioId)}>
                                                    <p className="spot-id">{espacioId}</p>
                                                    <p className="spot-estado">
                                                        <i className={`pi ${estado === 'disponible' ? 'pi-check-circle' : estado === 'reservado' ? 'pi-clock' : 'pi-times-circle'} icon-inline`} />
                                                        {estado === 'disponible' ? 'LIBRE' : estado === 'reservado' ? 'RESERVADO' : 'OCUPADO'}
                                                    </p>
                                                    {espacio?.placa && (
                                                        <>
                                                            <p className="spot-placa">{espacio.placa}</p>
                                                            <p className="spot-cliente">{espacio.cliente}</p>
                                                            <p className="spot-tiempo">
                                                                <i className="pi pi-clock icon-inline" />
                                                                {calcularTiempoEnPatio(espacio.fechaEntrada)}
                                                            </p>
                                                            <p className="spot-valor">
                                                                {formatoPesos(calcularValorEstimado(espacio.fechaEntrada, espacio.vehiculo))}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="parking-section">
                            <div className="section-header">
                                <h3 className="section-type"><i className="pi pi-send icon-inline" /> MOTOCICLETAS</h3>
                            </div>
                            <div className="parking-grid-section">
                                {Object.entries(PARKING_SPACES).filter(([_, fila]) => fila.tipo === 'MOTOCICLETA').map(([filaKey, fila]) => (
                                    <div key={filaKey} style={{ display: 'contents' }}>
                                        {fila.espacios.map(espacioId => {
                                            const espacio = espacios[espacioId];
                                            const estado = espacio?.estado || 'disponible';
                                            return (
                                                <div key={espacioId} className={`spot spot-${estado}`} onClick={() => manejarClickEspacio(espacioId)}>
                                                    <p className="spot-id">{espacioId}</p>
                                                    <p className="spot-estado">
                                                        <i className={`pi ${estado === 'disponible' ? 'pi-check-circle' : estado === 'reservado' ? 'pi-clock' : 'pi-times-circle'} icon-inline`} />
                                                        {estado === 'disponible' ? 'LIBRE' : estado === 'reservado' ? 'RESERVADO' : 'OCUPADO'}
                                                    </p>
                                                    {espacio?.placa && (
                                                        <>
                                                            <p className="spot-placa">{espacio.placa}</p>
                                                            <p className="spot-cliente">{espacio.cliente}</p>
                                                            <p className="spot-tiempo">
                                                                <i className="pi pi-clock icon-inline" />
                                                                {calcularTiempoEnPatio(espacio.fechaEntrada)}
                                                            </p>
                                                            <p className="spot-valor">
                                                                {formatoPesos(calcularValorEstimado(espacio.fechaEntrada, espacio.vehiculo))}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="parking-section">
                            <div className="section-header">
                                <h3 className="section-type"><i className="pi pi-truck icon-inline" /> CARGA PESADA</h3>
                            </div>
                            <div className="parking-grid-section">
                                {Object.entries(PARKING_SPACES).filter(([_, fila]) => fila.tipo === 'CARGA_PESADA').map(([filaKey, fila]) => (
                                    <div key={filaKey} style={{ display: 'contents' }}>
                                        {fila.espacios.map(espacioId => {
                                            const espacio = espacios[espacioId];
                                            const estado = espacio?.estado || 'disponible';
                                            return (
                                                <div key={espacioId} className={`spot spot-${estado}`} onClick={() => manejarClickEspacio(espacioId)}>
                                                    <p className="spot-id">{espacioId}</p>
                                                    <p className="spot-estado">
                                                        <i className={`pi ${estado === 'disponible' ? 'pi-check-circle' : estado === 'reservado' ? 'pi-clock' : 'pi-times-circle'} icon-inline`} />
                                                        {estado === 'disponible' ? 'LIBRE' : estado === 'reservado' ? 'RESERVADO' : 'OCUPADO'}
                                                    </p>
                                                    {espacio?.placa && (
                                                        <>
                                                            <p className="spot-placa">{espacio.placa}</p>
                                                            <p className="spot-cliente">{espacio.cliente}</p>
                                                            <p className="spot-tiempo">
                                                                <i className="pi pi-clock icon-inline" />
                                                                {calcularTiempoEnPatio(espacio.fechaEntrada)}
                                                            </p>
                                                            <p className="spot-valor">
                                                                {formatoPesos(calcularValorEstimado(espacio.fechaEntrada, espacio.vehiculo))}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="chart-container" style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '30px' }}>
                            <div style={{ width: '180px' }}>
                                {chartData.datasets && <Chart type="doughnut" data={chartData} options={chartOptions} />}
                            </div>
                        </div>
                    </div>
                )} 

                {pantalla === "entrada" && <RegistrarEntrada vehiculos={vehiculos} setVehiculos={setVehiculos} casillaPreasignada={location.state?.espacioPreseleccionado || ''} />}
                {pantalla === "salida" && <RegistrarSalida vehiculos={vehiculos} setVehiculos={setVehiculos} />}
                {pantalla === "ocupacion" && <EstadoOcupacion vehiculos={vehiculos} />}
                {pantalla === "reporte" && <ReporteDiario usuario={usuario} />}
                {pantalla === "admin" && <AdminPanel usuario={usuario} />}
                
            </main>

            {modalVisible && (
                <AsiganarEspacioManual
                    espacio={espacioSeleccionado}
                    onConfirm={confirmarAsignacion}
                    onClose={() => {
                        setModalVisible(false);
                        setEspacioSeleccionado(null);
                    }}
                />
            )}
        </div>
    );
};

export default MenuPrincipal;
/* ============================================================
   FIN: COMPONENTE PRINCIPAL
   ============================================================ */
