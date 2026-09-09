/* ============================================================
   INICIO: IMPORTACIONES
   ============================================================ */
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './RegistrarSalida.css'; 
import { apiUrl } from '../apiConfig';
/* ============================================================
   FIN: IMPORTACIONES
   ============================================================ */

/* ============================================================
   INICIO: COMPONENTE PRINCIPAL
   ============================================================ */
const RegistrarSalida = ({ vehiculos, setVehiculos }) => {
    
    /* ============================================================
       INICIO: ESTADOS Y REFERENCIAS
       ============================================================ */
    const [plateLetters, setPlateLetters] = useState('');
    const [plateNumbers, setPlateNumbers] = useState('');
    
    const [registro, setRegistro] = useState(null);
    const [cargando, setCargando] = useState(false);
    
    // ESTADO: Bloqueo de seguridad para evitar peticiones duplicadas
    const [isProcessing, setIsProcessing] = useState(false); 

    // ESTADOS DEL SISTEMA POS (PUNTO DE VENTA)
    const [metodoPago, setMetodoPago] = useState('CODE_CASH');
    const [transaccionId, setTransaccionId] = useState('');
    const [montoRecibido, setMontoRecibido] = useState('');
    const [numeroCelular, setNumeroCelular] = useState('');
    
    // ESTADOS PARA CONTINGENCIAS Y MONITOR EN VIVO
    const [estadoCobro, setEstadoCobro] = useState('IDLE'); 
    const [modoMixto, setModoMixto] = useState(false);
    const [montoMixtoEfectivo, setMontoMixtoEfectivo] = useState('');
    const [metodoPagoMixto, setMetodoPagoMixto] = useState('CODE_NEQUI');
    const [referenciaMixta, setReferenciaMixta] = useState('');
    const [tarifas, setTarifas] = useState([]);

    const numInputRef = useRef(null);
    const API_URL = apiUrl("/registros");
    const ADMIN_URL = apiUrl("/admin");
    /* ============================================================
       FIN: ESTADOS Y REFERENCIAS
       ============================================================ */

    useEffect(() => {
        const cargarTarifas = async () => {
            try {
                const response = await axios.get(`${ADMIN_URL}/tarifas`);
                setTarifas(response.data || []);
            } catch (error) {
                console.warn("No se pudieron cargar tarifas administrativas. Se usaran valores por defecto.", error);
            }
        };
        cargarTarifas();
    }, []);

    /* ============================================================
       INICIO: MANEJADORES DE INPUTS
       ============================================================ */
    const handleLettersChange = (e) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, ''); 
        if (val.length <= 3) {
            setPlateLetters(val);
            if (val.length === 3) numInputRef.current.focus();
        }
    };

    const handleNumbersChange = (e) => {
        const val = e.target.value.toUpperCase(); 
        if (val.length <= 3) setPlateNumbers(val);
    };
    /* ============================================================
       FIN: MANEJADORES DE INPUTS
       ============================================================ */

    /* ============================================================
       INICIO: LÓGICA DE BÚSQUEDA
       ============================================================ */
    const buscarVehiculoPorPlaca = async (placaCompleta) => {
        if (placaCompleta.length < 5) return alert("Placa incompleta");

        setCargando(true);
        try {
            const response = await axios.get(`${API_URL}/activos`);
            const encontrado = response.data.find(r => r.placa.toUpperCase() === placaCompleta);
            
            if (encontrado) {
                setRegistro(encontrado);
            } else {
                alert("Vehículo no encontrado o ya finalizado.");
                setRegistro(null);
            }
        } catch (error) {
            console.error("Error buscando placa", error);
            alert("Error de conexión con el servidor");
        } finally {
            setCargando(false);
        }
    };

    const buscarVehiculo = async () => {
        buscarVehiculoPorPlaca(plateLetters + plateNumbers);
    };

    // CU-CAJ-01: Permite que caja liquide una salida escaneando el QR del ticket de ingreso.
    useEffect(() => {
        const parametros = new URLSearchParams(window.location.search);
        const placaQr = (parametros.get('placa') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (placaQr.length >= 5) {
            setPlateLetters(placaQr.slice(0, 3));
            setPlateNumbers(placaQr.slice(3, 6));
            buscarVehiculoPorPlaca(placaQr);
        }
    }, []);
    /* ============================================================
       FIN: LÓGICA DE BÚSQUEDA
       ============================================================ */

    /* ============================================================
       INICIO: CALCULADORA DE TIEMPO Y COBRO DINÁMICO
       ============================================================ */
    const normalizarTipoVehiculo = (tipoVehiculo = '') => {
        const tipo = tipoVehiculo
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        if (tipo.includes('MOTO')) return 'MOTOCICLETA';
        if (tipo.includes('PESADO') || tipo.includes('CARGA')) return 'PESADO';
        return 'AUTOMOVIL';
    };

    const obtenerTarifaPorTipo = (tipoVehiculo) => {
        const tipoCanonico = normalizarTipoVehiculo(tipoVehiculo);
        const tarifaAdmin = tarifas.find(t => normalizarTipoVehiculo(t.tipoVehiculo) === tipoCanonico);
        if (tarifaAdmin?.valorMinuto !== undefined) return Number(tarifaAdmin.valorMinuto);

        const tarifasPorDefecto = {
            AUTOMOVIL: 50,
            MOTOCICLETA: 30,
            PESADO: 70
        };
        return tarifasPorDefecto[tipoCanonico] || 50;
    };

    const calcularResumen = () => {
        if (!registro) return { minutosTotales: 0, totalEstimado: 0, tarifaAplicada: 0, tipoVehiculo: '' };
        
        const entrada = new Date(registro.fecha_entrada || registro.fechaEntrada);
        const ahora = new Date();
        const diferenciaMs = ahora - entrada;
        const minutosTotales = Math.max(1, Math.floor(diferenciaMs / (1000 * 60)));
        
        const tipoVehiculo = (registro.tipo_vehiculo || registro.tipoVehiculo || 'CARRO').toUpperCase();
        const tarifaPorMinuto = obtenerTarifaPorTipo(tipoVehiculo);

        const totalEstimado = minutosTotales * tarifaPorMinuto; 
        
        return { minutosTotales, totalEstimado, tarifaAplicada: tarifaPorMinuto, tipoVehiculo };
    };
    
    const resumen = calcularResumen();
    const montoEfectivo = Number(modoMixto ? montoMixtoEfectivo || 0 : montoRecibido || 0);
    const cambio = montoEfectivo - resumen.totalEstimado;
    const saldoMixto = Math.max(0, resumen.totalEstimado - Number(montoMixtoEfectivo || 0));
    const montoMixtoInvalido = modoMixto && Number(montoMixtoEfectivo || 0) >= resumen.totalEstimado;
    const pagoMixtoValido = modoMixto
        ? Number(montoMixtoEfectivo || 0) > 0
            && Number(montoMixtoEfectivo || 0) < resumen.totalEstimado
            && metodoPagoMixto !== 'CODE_CASH'
        : true;

    const nombreMetodoPago = (codigo) => ({
        CODE_CASH: 'Efectivo',
        CODE_NEQUI: 'Nequi',
        CODE_DAVIP: 'DaviPlata',
        CODE_TRANS: 'QR Banco',
        CODE_CARD: 'Datáfono'
    }[codigo] || codigo);

    const generarNumeroComprobante = (placa = '') => {
        const ahora = new Date();
        const fecha = ahora.toISOString().slice(0, 10).replace(/-/g, '');
        const hora = ahora.toTimeString().slice(0, 8).replace(/:/g, '');
        return `LOT-${fecha}-${hora}-${String(placa).toUpperCase()}`;
    };
    /* ============================================================
       FIN: CALCULADORA DE TIEMPO Y COBRO DINÁMICO
       ============================================================ */

    /* ============================================================
       INICIO: EJECUCIÓN DE SALIDA Y LIBERACIÓN DE CASILLA
       ============================================================ */
    const simularCobroDigital = () => {
        if (numeroCelular.length < 10) return alert("Ingrese un celular válido.");
        setEstadoCobro('ESPERANDO');
        setTimeout(() => setEstadoCobro('PROCESANDO'), 2000);
        setTimeout(() => setEstadoCobro('EXITOSO'), 4000); 
    };

    const finalizarSalida = async (esAprobacionManual = false) => {
        if (!registro || isProcessing) return;

        if (!esAprobacionManual && modoMixto && !pagoMixtoValido) {
            return alert("PAGO MIXTO INCOMPLETO: registre el valor en efectivo y seleccione el segundo medio de pago.");
        }

        if (!esAprobacionManual && !modoMixto && metodoPago === 'CODE_CASH' && cambio < 0) {
            return alert("FONDOS INSUFICIENTES: El dinero ingresado no cubre la tarifa.");
        }

        setIsProcessing(true);

        try {
            const numeroComprobante = generarNumeroComprobante(registro.placa);
            const referenciaExterna = modoMixto ? referenciaMixta : (transaccionId || numeroCelular || '');
            const metodoFinal = modoMixto ? `MIXTO_EFECTIVO_${metodoPagoMixto}` : metodoPago;
            const referenciaFinal = modoMixto
                ? `COMPROBANTE:${numeroComprobante};EFECTIVO:${montoMixtoEfectivo};${nombreMetodoPago(metodoPagoMixto)}:${saldoMixto};REF_EXTERNA:${referenciaExterna || 'SIN_REFERENCIA_EXTERNA'}`
                : `COMPROBANTE:${numeroComprobante};REF_EXTERNA:${referenciaExterna || 'SIN_REFERENCIA_EXTERNA'}`;
            const detallePago = {
                modoMixto,
                metodoPago: nombreMetodoPago(metodoPago),
                metodoPagoMixto: nombreMetodoPago(metodoPagoMixto),
                comprobante: numeroComprobante,
                total: resumen.totalEstimado,
                efectivo: modoMixto ? Number(montoMixtoEfectivo || 0) : Number(montoRecibido || resumen.totalEstimado),
                saldoMixto,
                cambio: modoMixto ? 0 : cambio,
                referencia: referenciaExterna,
                minutos: resumen.minutosTotales,
                tarifa: resumen.tarifaAplicada
            };
            const url = `${API_URL}/salida/placa/${registro.placa}?metodoPago=${encodeURIComponent(metodoFinal)}&transaccionId=${encodeURIComponent(referenciaFinal)}`;
            const response = await axios.put(url);
            
            if (response.status === 200) {
                if (esAprobacionManual) alert("SALIDA MANUAL REGISTRADA BAJO RESPONSABILIDAD DEL CAJERO.");
                else alert("SALIDA EXITOSA: Pago procesado.");
                
                imprimirTicket(response.data, detallePago);
                
                const resLista = await axios.get(`${API_URL}/activos`);
                setVehiculos(resLista.data);

                setRegistro(null);
                setPlateLetters('');
                setPlateNumbers('');
                setTransaccionId('');
                setMontoRecibido('');
                setNumeroCelular('');
                setEstadoCobro('IDLE');
                setModoMixto(false);
                setMontoMixtoEfectivo('');
                setMetodoPagoMixto('CODE_NEQUI');
                setReferenciaMixta('');
            }
        } catch (error) { 
            console.error("Error al salir:", error);
            alert("Error al procesar el pago o la salida."); 
        } finally {
            setIsProcessing(false);
        }
    };

    const formatoMoneda = (valor) => `$ ${Number(valor || 0).toLocaleString('es-CO')}`;

    const textoSeguro = (valor) => String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const imprimirTicket = (datosFinales, detallePago) => {
        const ticket = { ...registro, ...datosFinales };
        const fechaEntrada = ticket.fecha_entrada || ticket.fechaEntrada || registro?.fecha_entrada || registro?.fechaEntrada;
        const fechaSalida = ticket.fecha_salida || ticket.fechaSalida || new Date().toISOString();
        const cupo = ticket.lugar_asignado || ticket.lugarAsignado || registro?.lugar_asignado || registro?.lugarAsignado || '';
        const lineasPago = detallePago.modoMixto
            ? `
                <p><strong>Efectivo:</strong> ${formatoMoneda(detallePago.efectivo)}</p>
                <p><strong>${textoSeguro(detallePago.metodoPagoMixto)}:</strong> ${formatoMoneda(detallePago.saldoMixto)}</p>
                ${detallePago.referencia ? `<p><strong>Ref. externa:</strong> ${textoSeguro(detallePago.referencia)}</p>` : ''}
            `
            : `
                <p><strong>Medio:</strong> ${textoSeguro(detallePago.metodoPago)}</p>
                <p><strong>Recibido:</strong> ${formatoMoneda(detallePago.efectivo)}</p>
                <p><strong>Cambio:</strong> ${formatoMoneda(Math.max(0, detallePago.cambio))}</p>
                ${detallePago.referencia ? `<p><strong>Ref. externa:</strong> ${textoSeguro(detallePago.referencia)}</p>` : ''}
            `;

        const ventanaImpresion = window.open('', '_blank', 'width=380,height=680');
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Comprobante de Salida - Parqueadero LOT</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 18px; text-align: center; }
                        .ticket { max-width: 310px; margin: 0 auto; }
                        h2 { margin: 0 0 6px; }
                        p { margin: 6px 0; font-size: 13px; }
                        .placa { font-size: 28px; font-weight: 900; letter-spacing: 5px; margin: 10px 0; }
                        .total { font-size: 24px; font-weight: 900; margin: 10px 0; }
                        .linea { border-top: 1px dashed #333; margin: 12px 0; }
                        .nota { font-size: 11px; color: #333; }
                        .detalle { text-align: left; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <h2>PARQUEADERO LOT</h2>
                        <p>Comprobante de salida</p>
                        <p class="nota">No equivale a factura electrónica</p>
                        <hr>
                        <div class="placa">${textoSeguro(ticket.placa)}</div>
                        <div class="detalle">
                            <p><strong>Comprobante:</strong> ${textoSeguro(detallePago.comprobante)}</p>
                            <p><strong>Cupo:</strong> ${textoSeguro(cupo)}</p>
                            <p><strong>Vehículo:</strong> ${textoSeguro(ticket.tipo_vehiculo || ticket.tipoVehiculo || 'SIN ESPECIFICAR')}</p>
                            <p><strong>Ingreso:</strong> ${new Date(fechaEntrada).toLocaleString('es-CO')}</p>
                            <p><strong>Salida:</strong> ${new Date(fechaSalida).toLocaleString('es-CO')}</p>
                            <p><strong>Tiempo:</strong> ${detallePago.minutos} MIN</p>
                            <p><strong>Tarifa:</strong> ${formatoMoneda(detallePago.tarifa)} / MIN</p>
                        </div>
                        <div class="linea"></div>
                        <div class="total">${formatoMoneda(detallePago.total)}</div>
                        <div class="detalle">
                            ${lineasPago}
                        </div>
                        <div class="linea"></div>
                        <p>Pago registrado y cupo liberado.</p>
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
    /* ============================================================
       FIN: EJECUCIÓN DE SALIDA Y LIBERACIÓN DE CASILLA
       ============================================================ */

    /* ============================================================
       INICIO: RENDERIZADO DE LA INTERFAZ (UI)
       ============================================================ */
    const salidaBloqueada = (modoMixto && !pagoMixtoValido)
        || (!modoMixto && metodoPago === 'CODE_CASH' && cambio < 0)
        || (estadoCobro === 'ESPERANDO' || estadoCobro === 'PROCESANDO');
    const claseBtnFinalizar = `btn-finalizar-neon btn-maestro ${salidaBloqueada ? 'disabled-visual' : ''}`;

    return (
        <div className="salida-container">
            <h1 className="neon-text-green">Terminal de Salida y POS</h1>

            {/* BUSCADOR */}
            <div className="card-salida">
                <h2 className="punto-titulo">Buscador de Placas Activas</h2>
                <div className="buscador-box-pro">
                    <div className="plate-inputs-container">
                        <input type="text" placeholder="AAA" className="input-plate letras" value={plateLetters} onChange={handleLettersChange} />
                        <span className="plate-divider">-</span>
                        <input type="text" placeholder="123" className="input-plate numeros" ref={numInputRef} value={plateNumbers} onChange={handleNumbersChange} />
                    </div>
                    <button onClick={buscarVehiculo} className="btn-buscar-pro" disabled={cargando}>
                        {cargando ? '...' : 'BUSCAR'}
                    </button>
                </div>
            </div>

            {registro && (
                <div className="grid-salida">
                    {/* PANEL IZQUIERDO: RESUMEN */}
                    <div className="card-salida border-green">
                        <h2 className="punto-titulo">Resumen del Servicio</h2>
                        <div className="info-box">
                            <p>Placa: <span className="highlight" style={{ fontSize: '1.2rem' }}>{registro.placa}</span></p>
                            <p>Ingreso: <span className="text-low">{new Date(registro.fecha_entrada || registro.fechaEntrada).toLocaleString()}</span></p>
                            <p>Vehículo: <span className="text-low">{resumen.tipoVehiculo}</span></p>
                            <hr className="divider" />
                            <div className="total-display text-center">
                                <p className="label">TIEMPO: {resumen.minutosTotales} MIN</p>
                                <p className="label" style={{fontSize: '0.8rem', color: '#888'}}>TARIFA: ${resumen.tarifaAplicada}/min</p>
                                <h2 className="monto-neon" style={{ fontSize: '2.5rem' }}>
                                    $ {resumen.totalEstimado.toLocaleString()}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* PANEL DERECHO: PASARELA DE PAGOS ÁGIL */}
                    <div className="card-salida border-yellow">
                        <div className="metodo-header">
                            <h2 className="punto-titulo">Medio de Pago</h2>
                            <button 
                                type="button"
                                className={`btn-mixto ${modoMixto ? 'activo-mixto' : ''}`}
                                onClick={() => {
                                    setModoMixto(!modoMixto);
                                    setMontoRecibido('');
                                    setMontoMixtoEfectivo('');
                                }}
                            >
                                <i className="pi pi-sync icon-inline" /> Pago Mixto
                            </button>
                        </div>

                        <div className="grid-metodos">
                            <button onClick={() => setMetodoPago('CODE_CASH')} className={`btn-metodo ${metodoPago === 'CODE_CASH' ? 'activo-cash' : ''}`}><i className="pi pi-money-bill icon-inline" /> Efectivo</button>
                            <button onClick={() => setMetodoPago('CODE_NEQUI')} className={`btn-metodo ${metodoPago === 'CODE_NEQUI' ? 'activo-nequi' : ''}`}><i className="pi pi-mobile icon-inline" /> Nequi</button>
                            <button onClick={() => setMetodoPago('CODE_DAVIP')} className={`btn-metodo ${metodoPago === 'CODE_DAVIP' ? 'activo-davip' : ''}`}><i className="pi pi-wallet icon-inline" /> DaviPlata</button>
                            <button onClick={() => setMetodoPago('CODE_TRANS')} className={`btn-metodo ${metodoPago === 'CODE_TRANS' ? 'activo-trans' : ''}`}><i className="pi pi-qrcode icon-inline" /> QR Banco</button>
                            <button onClick={() => setMetodoPago('CODE_CARD')} className={`btn-metodo ${metodoPago === 'CODE_CARD' ? 'activo-card' : ''}`}><i className="pi pi-credit-card icon-inline" /> Datáfono</button>
                        </div>

                        {/* MÓDULO 1: EFECTIVO & CALCULADORA */}
                        {!modoMixto && metodoPago === 'CODE_CASH' && (
                            <div className="payment-module animate-fade">
                                <label>Valor recibido en efectivo:</label>
                                <input type="number" className="input-lote" placeholder="Digite el valor entregado por el cliente" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} />
                                
                                <div className={`vueltas-panel ${cambio >= 0 ? 'ok' : 'falta'}`}>
                                    <p className="vueltas-titulo">{cambio >= 0 ? 'VUELTAS:' : 'FALTA:'}</p>
                                    <h3 className={`vueltas-valor ${cambio >= 0 ? 'ok' : 'falta'}`}>
                                        $ {Math.abs(cambio).toLocaleString()}
                                    </h3>
                                </div>
                            </div>
                        )}

                        {/* MÓDULO 2: BILLETERAS DIGITALES CON MONITOR */}
                        {!modoMixto && (metodoPago === 'CODE_NEQUI' || metodoPago === 'CODE_DAVIP') && (
                            <div className="payment-module animate-fade">
                                <label>Celular del Cliente:</label>
                                <input type="tel" className="input-lote" placeholder="Ej: 300 123 4567" maxLength="10" value={numeroCelular} onChange={(e) => setNumeroCelular(e.target.value)} />
                                
                                {estadoCobro === 'IDLE' && (
                                    <button onClick={simularCobroDigital} className={`lot-btn-pill btn-notificacion ${metodoPago === 'CODE_NEQUI' ? 'bg-nequi' : 'bg-davip'}`}>
                                        Enviar Notificación de Cobro
                                    </button>
                                )}
                                {estadoCobro === 'ESPERANDO' && <div className="estado-msg esperando"><i className="pi pi-clock icon-inline" /> Esperando que el cliente acepte... (02:59)</div>}
                                {estadoCobro === 'PROCESANDO' && <div className="estado-msg procesando"><i className="pi pi-spin pi-spinner icon-inline" /> Procesando con el banco...</div>}
                                {estadoCobro === 'EXITOSO' && <div className="estado-msg exitoso"><i className="pi pi-check-circle icon-inline" /> PAGO APROBADO</div>}
                            </div>
                        )}

                        {/* MÓDULO 3: PANTALLA CLIENTE / QR */}
                        {!modoMixto && metodoPago === 'CODE_TRANS' && (
                            <div className="payment-module animate-fade text-center">
                                <button className="lot-btn-pill btn-qr"><i className="pi pi-qrcode icon-inline" /> Enviar QR a Pantalla del Cliente</button>
                                <p className="nota-qr">* Verifique la transferencia antes de finalizar.</p>
                            </div>
                        )}

                        {/* MÓDULO 4: DATÁFONO */}
                        {!modoMixto && metodoPago === 'CODE_CARD' && (
                            <div className="payment-module animate-fade">
                                <label>Voucher / Aprobación:</label>
                                <input type="text" className="input-lote" placeholder="Ej: APROBADO-001122" value={transaccionId} onChange={(e) => setTransaccionId(e.target.value.toUpperCase())} />
                            </div>
                        )}

                        {/* MÓDULO OPCIONAL: PAGO MIXTO */}
                        {modoMixto && (
                            <div className="mixto-panel">
                                <div className="mixto-total">
                                    <span>Total a pagar</span>
                                    <strong>$ {resumen.totalEstimado.toLocaleString()}</strong>
                                </div>

                                <label className="mixto-titulo">1. Valor que recibe en efectivo:</label>
                                <input type="number" className="input-lote" placeholder="Ej: 2000" value={montoMixtoEfectivo} onChange={(e) => setMontoMixtoEfectivo(e.target.value)} />

                                <div className={`mixto-saldo ${montoMixtoInvalido ? 'error' : ''}`}>
                                    <span>2. Saldo automático para el otro medio</span>
                                    <strong>$ {saldoMixto.toLocaleString()}</strong>
                                </div>

                                <label className="mixto-titulo">3. Otro medio de pago:</label>
                                <select className="input-lote" value={metodoPagoMixto} onChange={(e) => setMetodoPagoMixto(e.target.value)}>
                                    <option value="CODE_NEQUI">Nequi</option>
                                    <option value="CODE_DAVIP">DaviPlata</option>
                                    <option value="CODE_TRANS">QR Banco</option>
                                    <option value="CODE_CARD">Datáfono</option>
                                </select>

                                <label className="mixto-titulo">4. Referencia externa opcional:</label>
                                <input type="text" className="input-lote" placeholder="Ej: NEQUI 3001234567 / VOUCHER 001122" value={referenciaMixta} onChange={(e) => setReferenciaMixta(e.target.value.toUpperCase())} />

                                <div className="mixto-resumen">
                                    <span>Efectivo: ${Number(montoMixtoEfectivo || 0).toLocaleString()}</span>
                                    <span>{nombreMetodoPago(metodoPagoMixto)}: ${saldoMixto.toLocaleString()}</span>
                                </div>
                                {montoMixtoInvalido ? (
                                    <p className="mixto-nota error">Para pago mixto el efectivo debe ser menor al total.</p>
                                ) : (
                                    <p className="mixto-nota">El sistema genera el número de comprobante al finalizar. Este campo solo guarda una referencia externa si existe.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* BOTON MAESTRO (FINALIZAR Y CONTINGENCIA) */}
                    <div className="master-actions">
                        <button 
                            onClick={() => finalizarSalida(false)} 
                            className={claseBtnFinalizar}
                            disabled={isProcessing || salidaBloqueada}
                        >
                            {isProcessing ? 'PROCESANDO...' : (estadoCobro === 'EXITOSO' ? 'ABRIR BARRERA Y LIBERAR PUESTO' : `FINALIZAR SALIDA - ${registro.lugar_asignado || registro.lugarAsignado}`)}
                        </button>
                        
                        <button 
                            type="button"
                            className="btn-emergencia"
                            onClick={() => {
                                if (window.confirm("ALERTA: ¿Está seguro de forzar la salida? Esto registrará la salida sin confirmación bancaria automática.")) {
                                    finalizarSalida(true);
                                }
                            }} 
                            disabled={isProcessing}
                        >
                            <span className="icon-warning"><i className="pi pi-exclamation-triangle" /></span> Aprobación Manual (Falla del Banco)
                        </button>
                    </div>

                    {/* ============================================================
                       INICIO: TICKET DE IMPRESIÓN
                       ============================================================ */}
                    <div id="ticket-impresion" className="ticket-impresion">
                        <h2 className="ticket-titulo">PARQUEADERO LOT</h2>
                        <p className="ticket-centro">NIT: 900.123.456-7</p>
                        <p className="ticket-centro">Calle de los Lagos 123-21, Cali</p>
                        <div className="ticket-divisor">--------------------------------</div>
                        
                        <p><strong>Ticket #:</strong> 00{registro.id}</p>
                        <p><strong>Placa:</strong> {registro.placa}</p>
                        <p><strong>Vehículo:</strong> {resumen.tipoVehiculo}</p>
                        <p><strong>Ingreso:</strong> {new Date(registro.fecha_entrada || registro.fechaEntrada).toLocaleString()}</p>
                        <p><strong>Salida:</strong> {new Date().toLocaleString()}</p>
                        <p><strong>Tiempo total:</strong> {resumen.minutosTotales} Min</p>
                        <p><strong>Tarifa base:</strong> ${resumen.tarifaAplicada}/min</p>
                        
                        <div className="ticket-divisor">--------------------------------</div>
                        <h3 className="ticket-total">TOTAL: ${resumen.totalEstimado.toLocaleString()}</h3>
                        <div className="ticket-divisor">--------------------------------</div>
                        
                        <p><strong>Método de pago:</strong> {modoMixto ? `Mixto: efectivo + ${nombreMetodoPago(metodoPagoMixto)}` : nombreMetodoPago(metodoPago)}</p>
                        <p className="ticket-centro" style={{marginTop: '15px'}}>¡Gracias por su visita!</p>
                        <p className="ticket-centro">Conserve este recibo.</p>
                    </div>
                    {/* ============================================================
                       FIN: TICKET DE IMPRESIÓN
                       ============================================================ */}
                </div>      
            )} 
        </div>
    );
};

export default RegistrarSalida;
