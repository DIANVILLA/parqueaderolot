/* ============================================================
   INICIO: IMPORTACIONES
   ============================================================ */
import React, { useState } from 'react';
import './ReporteDiario.css';
/* ============================================================
   FIN: IMPORTACIONES
   ============================================================ */

/* ============================================================
   INICIO: COMPONENTE PRINCIPAL
   ============================================================ */
const ReporteDiario = () => {
    
    /* ============================================================
       INICIO: ESTADOS DE LA APLICACIÓN
       ============================================================ */
    const [efectivoDeclarado, setEfectivoDeclarado] = useState('');
    const [gastos, setGastos] = useState('');
    const [motivoGasto, setMotivoGasto] = useState('');
    
    // Control de Vistas: EMPLEADO -> PIN -> ADMIN
    const [vistaActual, setVistaActual] = useState('EMPLEADO');
    const [pinInput, setPinInput] = useState('');
    
    // Seguridad y Auditoría
    const PIN_ADMIN = '7788'; // PIN de acceso temporal del administrador
    const [bitacoraAccesos, setBitacoraAccesos] = useState([]);
    const [turnoCongelado, setTurnoCongelado] = useState(false);

    // DATOS SIMULADOS (Lo que traeremos de Java después)
    const ingresos = { efectivo: 150000, transferencias: 85000, tarjetas: 45000 };
    const operacion = { baseInicial: 50000 };
    const trafico = { ingresados: 45, salidos: 38, enPatio: 7, salidasManuales: 2 };
    /* ============================================================
       FIN: ESTADOS DE LA APLICACIÓN
       ============================================================ */

    /* ============================================================
       INICIO: CÁLCULOS FINANCIEROS
       ============================================================ */
    const gastosRegistrados = Number(gastos) || 0;
    const declaradoPorEmpleado = Number(efectivoDeclarado) || 0;
    const totalIngresos = ingresos.efectivo + ingresos.transferencias + ingresos.tarjetas;
    
    const efectivoEsperadoSistema = (ingresos.efectivo + operacion.baseInicial) - gastosRegistrados;
    const diferenciaCaja = declaradoPorEmpleado - efectivoEsperadoSistema;
    /* ============================================================
       FIN: CÁLCULOS FINANCIEROS
       ============================================================ */

    /* ============================================================
       INICIO: LÓGICA Y FUNCIONES DE ACCIÓN
       ============================================================ */
    const manejarDeclaracionCajero = (e) => {
        e.preventDefault();
        setVistaActual('PIN'); // Bloquea la pantalla y pide contraseña
    };

    const verificarPin = (e) => {
        e.preventDefault();
        const fechaHora = new Date().toLocaleString();
        
        if (pinInput === PIN_ADMIN) {
            // Guarda el registro silencioso de acceso exitoso
            setBitacoraAccesos([...bitacoraAccesos, { fecha: fechaHora, estado: 'ACCESO AUTORIZADO' }]);
            setVistaActual('ADMIN');
        } else {
            // Guarda el registro de intento de hackeo/error
            setBitacoraAccesos([...bitacoraAccesos, { fecha: fechaHora, estado: 'INTENTO FALLIDO (PIN INCORRECTO)' }]);
            alert("Acceso Denegado. PIN Incorrecto.");
        }
        setPinInput(''); // Limpia el input
    };

    const congelarTurno = () => {
        if(window.confirm("¿Está seguro de cerrar y congelar este turno? No se podrán hacer más modificaciones.")) {
            setTurnoCongelado(true);
            alert("Turno Congelado Exitosamente. Imprimiendo Reporte Z...");
            window.print();
        }
    };

    const verBitacoraOculta = () => {
        console.table(bitacoraAccesos);
        alert("Revisa la consola (F12) para ver la bitácora oculta de accesos.");
    };
    /* ============================================================
       FIN: LÓGICA Y FUNCIONES DE ACCIÓN
       ============================================================ */

    /* ============================================================
       INICIO: VISTA 1 - EMPLEADO (ARQUEO A CIEGAS)
       ============================================================ */
    if (vistaActual === 'EMPLEADO') {
        return (
            <div className="reporte-container empleado-view">
                <div className="reporte-header">
                    <h1 className="section-title">CIERRE DE TURNO</h1>
                    <p className="operador-texto">Operador: <span className="highlight">Cajero 1</span></p>
                </div>

                <form className="cierre-form" onSubmit={manejarDeclaracionCajero}>
                    <div className="alerta-cierre">
                        <i className="pi pi-exclamation-triangle icon-inline" /> <strong>ARQUEO A CIEGAS:</strong> Ingrese el dinero exacto físico en caja.
                    </div>

                    <div className="field-group">
                        <label>Efectivo Total Físico en Gaveta ($):</label>
                        <input type="number" className="input-cierre principal" value={efectivoDeclarado} onChange={(e) => setEfectivoDeclarado(e.target.value)} required />
                    </div>

                    <h3 className="subtitulo-gastos">Vales / Gastos del Turno (Opcional)</h3>
                    <div className="field-group-multi">
                        <div className="flex-1">
                            <label>Monto ($):</label>
                            <input type="number" className="input-cierre" value={gastos} onChange={(e) => setGastos(e.target.value)} />
                        </div>
                        <div className="flex-2">
                            <label>Motivo:</label>
                            <input type="text" className="input-cierre" value={motivoGasto} onChange={(e) => setMotivoGasto(e.target.value.toUpperCase())} />
                        </div>
                    </div>

                    <button type="submit" className="btn-cerrar-turno">DECLARAR Y CONTINUAR</button>
                </form>
            </div>
        );
    }
    /* ============================================================
       FIN: VISTA 1 - EMPLEADO (ARQUEO A CIEGAS)
       ============================================================ */

    /* ============================================================
       INICIO: VISTA 2 - MODAL DE PIN DE SEGURIDAD
       ============================================================ */
    if (vistaActual === 'PIN') {
        return (
            <div className="reporte-container pin-view">
                <div className="pin-card">
                    <h2><i className="pi pi-lock icon-inline" /> ACCESO RESTRINGIDO</h2>
                    <p>El turno ha sido declarado. Ingrese PIN de Administrador para ver el cuadre.</p>
                    <form onSubmit={verificarPin}>
                        <input type="password" placeholder="****" className="input-pin" maxLength="4" value={pinInput} onChange={(e) => setPinInput(e.target.value)} required autoFocus />
                        <button type="submit" className="btn-pin">DESBLOQUEAR AUDITORÍA</button>
                    </form>
                    <button type="button" className="btn-cancelar" onClick={() => setVistaActual('EMPLEADO')}>Volver / Corregir</button>
                </div>
            </div>
        );
    }
    /* ============================================================
       FIN: VISTA 2 - MODAL DE PIN DE SEGURIDAD
       ============================================================ */

    /* ============================================================
       INICIO: VISTA 3 - ADMINISTRADOR (AUDITORÍA FINAL)
       ============================================================ */
    return (
        <div className="reporte-container admin-view">
            {turnoCongelado && (
                <div className="alerta-congelado no-imprimir">
                    <i className="pi pi-lock icon-inline" /> ESTE TURNO ESTÁ CONGELADO Y CERRADO OFICIALMENTE.
                </div>
            )}

            <div className="reporte-header grid-header">
                <div>
                    <h1 className="section-title">REPORTE Z (Cierre de Caja)</h1>
                    <p className="operador-texto">Auditoría | <span className="highlight">Administrador</span></p>
                </div>
                {!turnoCongelado && (
                    <div className="acciones-exportar no-imprimir">
                        <button onClick={verBitacoraOculta} className="btn-bitacora">
                            <i className="pi pi-history icon-inline" /> Ver Logs Acceso
                        </button>
                    </div>
                )}
            </div>

            {/* PANEL DE TRÁFICO Y CONTINGENCIAS */}
            <div className="estadisticas-grid">
                <div className="stat-box">Vehículos Ingresados: <br/><strong>{trafico.ingresados}</strong></div>
                <div className="stat-box">Vehículos Salidos: <br/><strong>{trafico.salidos}</strong></div>
                <div className="stat-box">Amanecen en Patio: <br/><strong>{trafico.enPatio}</strong></div>
                <div className="stat-box alerta-box">Salidas Manuales: <br/><strong>{trafico.salidasManuales}</strong></div>
            </div>

            <div className="reporte-grid-admin">
                {/* BLOQUE INGRESOS DIGITALES Y EFECTIVO */}
                <div className="card seccion-ingresos">
                    <h3 className="card-titulo neon-verde">Ingresos Brutos</h3>
                    <div className="data-row"><span><i className="pi pi-money-bill icon-inline" /> Efectivo Sistema:</span> <span>${ingresos.efectivo.toLocaleString()}</span></div>
                    <div className="data-row"><span><i className="pi pi-mobile icon-inline" /> Transferencias:</span> <span>${ingresos.transferencias.toLocaleString()}</span></div>
                    <div className="data-row"><span><i className="pi pi-credit-card icon-inline" /> Datáfono:</span> <span>${ingresos.tarjetas.toLocaleString()}</span></div>
                    <div className="data-row total-row divider-top"><span>TOTAL INGRESOS:</span> <span>${totalIngresos.toLocaleString()}</span></div>
                </div>

                {/* BLOQUE MOVIMIENTOS GAVETA */}
                <div className="card seccion-gastos">
                    <h3 className="card-titulo neon-amarillo">Flujo Físico (Gaveta)</h3>
                    <div className="data-row"><span><i className="pi pi-wallet icon-inline" /> Base Inicial:</span> <span>${operacion.baseInicial.toLocaleString()}</span></div>
                    <div className="data-row">
                        <span><i className="pi pi-chart-line icon-inline" /> Vales/Gastos: <br/><span className="nota-pequena">{motivoGasto || 'Ninguno'}</span></span> 
                        <span className="texto-rojo">- ${gastosRegistrados.toLocaleString()}</span>
                    </div>
                    <div className="data-row total-row divider-top"><span>EFECTIVO ESPERADO:</span> <span>${efectivoEsperadoSistema.toLocaleString()}</span></div>
                </div>
            </div>

            {/* BLOQUE AUDITORÍA (CUADRE CIEGO) */}
            <div className="card auditoria-card">
                <h2 className="auditoria-titulo">Resultado del Arqueo a Ciegas</h2>
                
                <div className="auditoria-grid">
                    <div className="auditoria-item">
                        <p className="auditoria-label">Sistema Esperaba:</p>
                        <h3 className="auditoria-valor">${efectivoEsperadoSistema.toLocaleString()}</h3>
                    </div>
                    
                    <div className="auditoria-item borde-lateral">
                        <p className="auditoria-label">Empleado Declaró:</p>
                        <h3 className="auditoria-valor">${declaradoPorEmpleado.toLocaleString()}</h3>
                    </div>
                    
                    <div className="auditoria-item">
                        <p className="auditoria-label">Diferencia de Caja:</p>
                        <h2 className={`auditoria-diferencia ${diferenciaCaja >= 0 ? 'ok' : 'falta'}`}>
                            {diferenciaCaja > 0 ? '+' : ''}${diferenciaCaja.toLocaleString()}
                        </h2>
                        <span className="auditoria-mensaje">
                            {diferenciaCaja === 0 ? 'Cuadre Perfecto' : diferenciaCaja > 0 ? 'Sobrante' : 'Faltante'}
                        </span>
                    </div>
                </div>
            </div>

            {/* BOTÓN MAESTRO DE CIERRE */}
            {!turnoCongelado && (
                <div className="cierre-final-container no-imprimir">
                    <button className="btn-congelar" onClick={congelarTurno}>
                        <i className="pi pi-lock icon-inline" /> APROBAR Y CONGELAR TURNO
                    </button>
                    <button className="btn-exportar excel" style={{marginLeft: '10px'}}>
                        <i className="pi pi-file-excel icon-inline" /> Exportar Excel
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReporteDiario;
/* ============================================================
   FIN: COMPONENTE PRINCIPAL
   ============================================================ */
