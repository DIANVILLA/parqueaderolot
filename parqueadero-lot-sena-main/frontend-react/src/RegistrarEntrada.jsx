/*=======================================================================
   1. IMPORTACIONES Y CONFIGURACIÓN
=======================================================================*/
import React, { useState, useEffect } from 'react';
import './RegistrarEntrada.css';
import { apiUrl } from './apiConfig';

const RegistrarEntrada = ({ vehiculos, setVehiculos }) => {
    
    // Control del reloj de la pantalla de ingreso.
    const [fechaHoraActual, setFechaHoraActual] = useState(new Date());

    /*--- Estado del formulario de ingreso y propietario ---*/
    const [form, setForm] = useState({
        placa: '',
        tipo: 'Carro',
        modelo: '',
        color: '',
        nombrePropietario: '', 
        cedula: '',           
        telefono: '',          
        lugar: 'A-1', 
        notas: ''
    });

    // Actualiza el reloj en tiempo real.
    useEffect(() => {
        const timer = setInterval(() => setFechaHoraActual(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    /*--- Formateo de placa ---*/
    const handlePlacaChange = (e) => {
        let valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (valor.length > 3) {
            valor = valor.slice(0, 3) + '-' + valor.slice(3, 6);
        }
        setForm({ ...form, placa: valor });
    };

    /*--- Calculo de puesto sugerido ---*/
    const calcularLugar = (numero) => {
        const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const grupo = Math.floor((numero - 1) / 20);
        const letra = letras[grupo] || 'Z';
        return `${letra}${numero}`;
    };

    /*--- Impresion de comprobante ---*/
    const handleImprimir = () => {
        window.print(); 
    };

    /*--- Limpieza de formulario ---*/
    const handleLimpiar = () => {
        if (window.confirm("¿Vaciar el formulario?")) {
            setForm({
                placa: '', tipo: 'Carro', modelo: '', color: '', 
                nombrePropietario: '', cedula: '', telefono: '', 
                lugar: 'A-1', notas: ''
            });
        }
    };

    /*--- Registro de ingreso en backend ---*/
    const handleConfirmar = async () => {
        if (!form.placa || !form.cedula) return alert("Placa y Cédula obligatorias.");

        const datosParaEnviar = {
            placa: form.placa,
            tipoVehiculo: form.tipo,               
            modelo: form.modelo,
            color: form.color,
            propietarioNombre: form.nombrePropietario, 
            propietarioCedula: form.cedula,
            propietarioTelefono: form.telefono,
            lugarAsignado: form.lugar,
            observaciones: form.notas
        };

        try {
            const respuesta = await fetch(apiUrl('/registros'), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosParaEnviar)
            });

            if (respuesta.ok) {
                alert("REGISTRO EXITOSO EN MYSQL");
                handleLimpiar();
            } else {
                const msg = await respuesta.text();
                alert("ERROR: " + msg);
            }
        } catch (error) {
            alert("Error: No se pudo conectar con el servidor Java.");
        }
    };

    return (
        <div className="entrada-wrapper">   
            {/*==========================================================
               2. CABECERA DE LA PANTALLA
            ===========================================================*/}
            <div className="header-registro">
                <h2 className="title-main">ESTACIÓN DE SEGURIDAD <span className="verde-neon">| INGRESO</span></h2>
                <div className="badge-status">SISTEMA ACTIVO</div>
            </div>

            {/*==========================================================
               3. SECCIÓN DE MONITOREO (CÁMARAS HD)
            ===========================================================*/}
            <p className="section-label"><i className="pi pi-video icon-inline" /> VISTA DE CÁMARAS EN TIEMPO REAL</p>
            <div className="monitor-grid">
                <div className="cam-unit"><span>CAM_01 FRONT</span></div>
                <div className="cam-unit"><span>CAM_02 REAR</span></div>
                <div className="cam-unit"><span>CAM_03 L-SIDE</span></div>
                <div className="cam-unit"><span>CAM_04 R-SIDE</span></div>
            </div>

            {/*==========================================================
               4. PANEL DE DATOS TÉCNICOS (FORMULARIO)
            ===========================================================*/}
            <div className="form-panel">
                <p className="section-label">DATOS DEL VEHÍCULO Y PROPIETARIO</p>

                {/* BLOQUE: PLACA (PRINCIPAL) */}
                <div className="field-group full">
                    <label>IDENTIFICACIÓN DE PLACA</label>
                    <input 
                        type="text" 
                        className="input-placa-display" 
                        placeholder="___-___"
                        value={form.placa}
                        onChange={handlePlacaChange}
                    />
                </div>

                <div className="details-grid">
                    <div className="field-group">
                        <label>TIPO DE VEHÍCULO</label>
                        <select className="input-custom" value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})}>
                            <option>Carro</option>
                            <option>Camioneta</option>
                            <option>Motocicleta</option>
                            <option>Pesado</option>
                        </select>
                    </div>
                </div>

                {/*==========================================================
                   BLOQUE: DATOS DEL PROPIETARIO
                ===========================================================*/}
                <p className="section-label">IDENTIFICACIÓN DEL CLIENTE</p>
                <div className="details-grid">
                    <div className="field-group">
                        <label>NOMBRE COMPLETO</label>
                        <input className="input-custom" type="text" placeholder="Nombre del conductor" value={form.nombrePropietario} onChange={(e) => setForm({...form, nombrePropietario: e.target.value})} />
                    </div>
                
                    <div className="field-group">
                        <label>CÉDULA / DNI</label>
                        <input className="input-custom" type="text" placeholder="Número de documento" value={form.cedula} onChange={(e) => setForm({...form, cedula: e.target.value})} />
                    </div>

                    <div className="field-group">
                        <label>TELÉFONO DE CONTACTO</label>
                        <input className="input-custom" type="tel" placeholder="Ej: 300 123 4567" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} />
                    </div>

                    <div className="field-group">
                        <label>HORA DE INGRESO (EMPLEADO: READONLY)</label>
                        <input className="input-custom readonly" type="text" value={`${fechaHoraActual.toLocaleDateString()} - ${fechaHoraActual.toLocaleTimeString()}`} readOnly />
                    </div>
                </div>

                <div className="details-grid" style={{marginTop: '15px'}}>
                    <div className="field-group">
                        <label>MARCA / MODELO</label>
                        <input className="input-custom" type="text" placeholder="Ej: Toyota Hilux" value={form.modelo} onChange={(e) => setForm({...form, modelo: e.target.value})} />
                    </div>

                    <div className="field-group">
                        <label>COLOR EXTERIOR</label>
                        <input className="input-custom" type="text" placeholder="Ej: Gris Metalizado" value={form.color} onChange={(e) => setForm({...form, color: e.target.value})} />
                    </div>

                    <div className="field-group">
                        <label>ASIGNACIÓN DE LUGAR</label>
                        <input className="input-custom readonly" type="text" value={form.lugar} readOnly />
                    </div>
                </div>

                {/* BLOQUE: NOTAS DE ESTADO */}
                <div className="field-group" style={{marginTop: '20px'}}>
                    <label>EVIDENCIA FÍSICA / OBSERVACIONES</label>
                    <textarea 
                        className="input-custom text-area" 
                        placeholder="Describa rayones, golpes o estado de carga..."
                        value={form.notes}
                        onChange={(e) => setForm({...form, notas: e.target.value})}
                    ></textarea>
                </div>

                {/*==========================================================
                   5. BOTONES DE ACCIÓN
                ===========================================================*/}
                <div className="action-bar">
                    <button className="btn-save-main" onClick={handleConfirmar}>VALIDAR E INGRESAR VEHÍCULO</button>
                    <button className="btn-print-ticket" onClick={handleImprimir}><i className="pi pi-print icon-inline" /> BOTÓN DE IMPRESORA</button>
                    <button className="btn-clear" onClick={handleLimpiar}><i className="pi pi-trash icon-inline" /> LIMPIAR</button>
                </div>
            </div>
        </div>
    );
};

export default RegistrarEntrada;
