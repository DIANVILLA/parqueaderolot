import React, { useState, useEffect } from 'react';
import './EstadoOcupacion.css';

const EstadoOcupacion = ({ vehiculos = [] }) => {
    
    /* ============================================================
       INICIO: LÓGICA DE ESTADOS Y TIEMPO REAL
       ============================================================ */
    const [ahora, setAhora] = useState(new Date());
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    const [filtroZona, setFiltroZona] = useState('TODAS');
    const [modalPreliq, setModalPreliq] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setAhora(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const calcularEstancia = (fechaEntrada) => {
        if (!fechaEntrada) return { texto: '--', costo: 0, alerta: '' };
        const minutosTotales = Math.max(0, Math.floor((ahora - new Date(fechaEntrada)) / 60000));
        const horas = Math.floor(minutosTotales / 60);
        return { 
            texto: `${horas}h ${minutosTotales % 60}m`, 
            costo: minutosTotales * 50, 
            alerta: horas >= 12 ? 'alerta-roja' : horas >= 5 ? 'alerta-amarilla' : '' 
        };
    };
    /* ============================================================
       FIN: LÓGICA DE ESTADOS Y TIEMPO REAL
       ============================================================ */

    /* ============================================================
       INICIO: CÁLCULOS Y ESTADÍSTICAS POR ZONAS (A, B, C)
       ============================================================ */
    const vehiculosFiltrados = vehiculos.filter(v => {
        const coincidePlaca = v.placa.toLowerCase().includes(busqueda.toLowerCase());
        const coincideTipo = filtroTipo === 'TODOS' || v.tipo_vehiculo === filtroTipo;
        const coincideZona = filtroZona === 'TODAS' || v.lugar_asignado?.startsWith(filtroZona);
        return coincidePlaca && coincideTipo && coincideZona;
    }).sort((a, b) => new Date(b.fecha_entrada) - new Date(a.fecha_entrada));

    const obtenerStatsPorZona = () => {
        const zonas = {
            'A': { ocupados: 0, total: 40, nombre: 'MOTOCICLETAS' },
            'B': { ocupados: 0, total: 40, nombre: 'AUTOMÓVILES' },
            'C': { ocupados: 0, total: 40, nombre: 'CARGA PESADA' }
        };
        vehiculos.forEach(v => {
            const zona = v.lugar_asignado?.charAt(0).toUpperCase();
            if (zonas[zona]) zonas[zona].ocupados += 1;
        });
        return zonas;
    };

    const stats = obtenerStatsPorZona();
    /* ============================================================
       FIN: CÁLCULOS Y ESTADÍSTICAS POR ZONAS
       ============================================================ */

    return (
        <div className="ocupacion-container">
            
            {/* ============================================================
                INICIO: DASHBOARD DE CONTROL POR ZONAS (A, B, C)
                ============================================================ */}
            <div className="dashboard-zonas">
                {Object.keys(stats).map(key => (
                    <div key={key} className="card-zona">
                        <p className="zona-titulo">ZONA {key} - {stats[key].nombre}</p>
                        <div className="zona-datos">
                            <div className="dato">
                                <span>OCUPADOS</span>
                                <h2>{stats[key].ocupados}</h2>
                            </div>
                            <div className="dato">
                                <span>DISPONIBLES</span>
                                <h2 className="stat-neon">{stats[key].total - stats[key].ocupados}</h2>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* ============================================================
                FIN: DASHBOARD DE CONTROL POR ZONAS
                ============================================================ */}

            <h1 className="titulo-principal">Centro de Control y Recaudo</h1>

            {/* ============================================================
                INICIO: BARRA DE BÚSQUEDA Y FILTROS
                ============================================================ */}
            <div className="filtros-container">
                <input type="text" placeholder="Buscar placa..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="input-busqueda" />
                <select value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)} className="select-filtro">
                    <option value="TODAS">Todas las Zonas</option>
                    <option value="A">Zona A</option>
                    <option value="B">Zona B</option>
                    <option value="C">Zona C</option>
                </select>
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="select-filtro">
                    <option value="TODOS">Todos los Tipos</option>
                    <option value="AUTOMÓVIL">Automóvil</option>
                    <option value="MOTOCICLETA">Motocicleta</option>
                </select>
            </div>
            {/* ============================================================
                FIN: BARRA DE BÚSQUEDA Y FILTROS
                ============================================================ */}

            {/* ============================================================
                INICIO: TABLA EN VIVO
                ============================================================ */}
            <div className="tabla-wrapper">
                <table className="tabla-ocupacion">
                    <thead>
                        <tr><th>Casilla</th><th>Placa</th><th>Tipo</th><th>Ingreso</th><th>Tiempo</th><th>Acción</th></tr>
                    </thead>
                    <tbody>
                        {vehiculosFiltrados.map(v => {
                            const cal = calcularEstancia(v.fecha_entrada);
                            return (
                                <tr key={v.id} className={cal.alerta}>
                                    <td>{v.lugar_asignado}</td>
                                    <td>{v.placa}</td>
                                    <td>{v.tipo_vehiculo}</td>
                                    <td>{new Date(v.fecha_entrada).toLocaleTimeString()}</td>
                                    <td><i className="pi pi-clock icon-inline" />{cal.texto}</td>
                                    <td>
                                        <button onClick={() => setModalPreliq({ ...v, ...cal })} className="btn-preliquidar">
                                            <i className="pi pi-file icon-inline" /> Pre-liquidar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* ============================================================
                FIN: TABLA EN VIVO
                ============================================================ */}

            {/* ============================================================
                INICIO: MODAL DE PRE-LIQUIDACIÓN
                ============================================================ */}
            {modalPreliq && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Detalle de Cobro</h2>
                        <p>Placa: <strong>{modalPreliq.placa}</strong></p>
                        <p>Tiempo: {modalPreliq.texto}</p>
                        <h1 className="monto-modal">$ {modalPreliq.costo.toLocaleString()}</h1>
                        <button onClick={() => setModalPreliq(null)} className="btn-cerrar">Cerrar</button>
                    </div>
                </div>
            )}
            {/* ============================================================
                FIN: MODAL DE PRE-LIQUIDACIÓN
                ============================================================ */}
        </div>
    );
};

export default EstadoOcupacion;
