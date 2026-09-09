import React, { useState } from 'react';
import './RegistrarClienteNuevo.css';
import { apiUrl } from '../apiConfig';

const RegistrarClienteNuevo = () => {
    
    // ============================================================
    // 1. ESTADO DE DATOS (CLIENTE Y VEHÍCULO)
    // ============================================================
    const [form, setForm] = useState({
        id: '',
        nombre: '',
        tel: '',
        placa: '',
        tipo: 'Automóvil',
        contrato: 'Ocasional',
        marca: '',
        color: ''
    });

    const [esExistente, setEsExistente] = useState(false);

    // ============================================================
    // 2. VALIDACIONES DE TECLADO (BLOQUEO ESTRICTO)
    // ============================================================
    const valNumeros = (key, val) => {
        const num = val.replace(/[^0-9]/g, '');
        setForm({ ...form, [key]: num });
        // Búsqueda automática por ID para evitar duplicados
        if (key === 'id' && num.length >= 5) buscarExistente(num);
    };

    const valLetras = (val) => {
        setForm({ ...form, nombre: val.replace(/[^A-Za-zñÑáéíóúÁÉÍÓÚ\s]/g, '') });
    };

    const valPlaca = (val) => {
        setForm({ ...form, placa: val.toUpperCase().replace(/[^A-Z0-9]/g, '') });
    };

    // ============================================================
    // 3. CONEXIÓN CON EL SERVIDOR (PUERTO 8090)
    // ============================================================
    const buscarExistente = async (cedula) => {
        try {
            const res = await fetch(apiUrl(`/clientes/buscar/${cedula}`));
            if (res.ok) {
                const data = await res.json();
                setForm(prev => ({ ...prev, nombre: data.nombre || '', tel: data.telefono || '' }));
                setEsExistente(true);
            }
        } catch (e) { }
    };

    const ejecutarRegistro = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(apiUrl('/clientes/registrar'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                alert("CLIENTE GUARDADO EN LA BASE DE DATOS");
                window.location.reload();
            }
        } catch (e) { alert("ERROR: No se pudo conectar con el servidor 8090"); }
    };

    return (
        <div className="SITPAM-wrapper">
            
            {/* TÍTULO DEL MÓDULO */}
            <header className="SITPAM-header-simple">
                <h2>REGISTRO DE CLIENTE  <span className="SITPAM-neon">NUEVO</span></h2>
                <p>REGISTRO DE IDENTIDAD Y VINCULACIÓN DE VEHÍCULOS</p>
            </header>

            {/* FORMULARIO DE GESTIÓN (3 COLUMNAS) */}
            <main className="SITPAM-form-panel">
                <form onSubmit={ejecutarRegistro} className="SITPAM-grid">
                    
                    {/* DATOS DEL PROPIETARIO */}
                    <div className="SITPAM-field">
                        <label>CÉDULA / IDENTIFICACIÓN</label>
                        <input type="text" className="SITPAM-input" value={form.id} onChange={(e) => valNumeros('id', e.target.value)} required />
                    </div>

                    <div className="SITPAM-field">
                        <label>NOMBRE COMPLETO</label>
                        <input type="text" className="SITPAM-input" value={form.nombre} onChange={(e) => valLetras(e.target.value)} readOnly={esExistente} required />
                    </div>

                    <div className="SITPAM-field">
                        <label>TELÉFONO CONTACTO</label>
                        <input type="text" className="SITPAM-input" value={form.tel} onChange={(e) => valNumeros('tel', e.target.value)} readOnly={esExistente} required />
                    </div>

                    {/* DATOS DEL VEHÍCULO */}
                    <div className="SITPAM-field">
                        <label>PLACA (ID VEHÍCULO)</label>
                        <input type="text" className="SITPAM-input SITPAM-destaque" value={form.placa} onChange={(e) => valPlaca(e.target.value)} maxLength={6} required />
                    </div>

                    <div className="SITPAM-field">
                        <label>TIPO DE VEHÍCULO</label>
                        <select className="SITPAM-input" value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})}>
                            <option value="Automóvil">Automóvil</option>
                            <option value="Motocicleta">Motocicleta</option>
                        </select>
                    </div>

                    <div className="SITPAM-field">
                        <label>MODALIDAD DE PAGO</label>
                        <select className="SITPAM-input" value={form.contrato} onChange={(e) => setForm({...form, contrato: e.target.value})}>
                            <option value="Ocasional">Ocasional (Minutos)</option>
                            <option value="Mensual">Mensualidad (Fijo)</option>
                        </select>
                    </div>

                    <div className="SITPAM-field">
                        <label>MARCA</label>
                        <input type="text" className="SITPAM-input" value={form.marca} onChange={(e) => setForm({...form, marca: e.target.value})} required />
                    </div>

                    <div className="SITPAM-field">
                        <label>COLOR</label>
                        <input type="text" className="SITPAM-input" value={form.color} onChange={(e) => setForm({...form, color: e.target.value})} required />
                    </div>

                    {/* ÁREA DE ACCIÓN */}
                    <div className="SITPAM-actions-full">
                        <button type="submit" className="SITPAM-btn-pill">GUARDAR REGISTRO</button>
                        <button type="button" className="SITPAM-btn-border" onClick={() => window.location.reload()}>LIMPIAR PANTALLA</button>
                    </div>

                </form>
            </main>
        </div>
    );
};

export default RegistrarClienteNuevo;
