import React, { useEffect, useMemo, useState } from 'react';
import ParqueaderolotService from '../ParqueaderolotService';
import './AdminPanel.css';

const formatoMoneda = (valor) =>
    Number(valor || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const mayuscula = (valor) => valor.toUpperCase();
const minuscula = (valor) => valor.toLowerCase();

const AdminPanel = ({ usuario }) => {
    const hoy = new Date();
    const [cargando, setCargando] = useState(false);
    const [dashboard, setDashboard] = useState({});
    const [roles, setRoles] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [tarifas, setTarifas] = useState([]);
    const [huerfanos, setHuerfanos] = useState([]);
    const [historico, setHistorico] = useState({ registros: [], cierres: [] });
    const [bi, setBi] = useState({});
    const [auditoria, setAuditoria] = useState([]);
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [tabActiva, setTabActiva] = useState('resumen');

    const [usuarioForm, setUsuarioForm] = useState({ nombre: '', apellido: '', correo: '', password: '', rol: 'OPERARIO' });
    const [tarifaForm, setTarifaForm] = useState({ tipoVehiculo: 'AUTOMOVIL', valorMinuto: 50, activa: true });
    const [cierreForm, setCierreForm] = useState({
        responsableCorreo: usuario?.correo || 'admin@parqueaderolot.co',
        responsableRol: usuario?.rol || 'ADMINISTRADOR',
        baseInicial: 0,
        efectivoDeclarado: 0,
        gastos: 0,
        motivoGastos: ''
    });

    const responsable = usuario?.correo || 'admin';
    const tabsAdmin = [
        { id: 'resumen', label: 'Resumen', icon: 'pi pi-chart-line' },
        { id: 'tarifas', label: 'Tarifas', icon: 'pi pi-dollar' },
        { id: 'usuarios', label: 'Usuarios', icon: 'pi pi-users' },
        { id: 'caja', label: 'Caja', icon: 'pi pi-briefcase' },
        { id: 'reportes', label: 'Reportes BI', icon: 'pi pi-file-export' },
        { id: 'auditoria', label: 'Auditoria', icon: 'pi pi-shield' }
    ];

    const cargarTodo = async () => {
        setCargando(true);
        try {
            const [
                dashboardRes,
                rolesRes,
                usuariosRes,
                tarifasRes,
                huerfanosRes,
                historicoRes,
                biRes,
                auditoriaRes
            ] = await Promise.all([
                ParqueaderolotService.obtenerDashboardAdmin(),
                ParqueaderolotService.listarRolesAdmin(),
                ParqueaderolotService.listarUsuariosAdmin(),
                ParqueaderolotService.listarTarifasAdmin(),
                ParqueaderolotService.listarRegistrosHuerfanosAdmin(),
                ParqueaderolotService.obtenerHistoricoAdmin(anio, mes),
                ParqueaderolotService.obtenerBiAdmin(anio, mes),
                ParqueaderolotService.listarAuditoriaAdmin()
            ]);

            setDashboard(dashboardRes.data || {});
            setRoles(rolesRes.data || []);
            setUsuarios(usuariosRes.data || []);
            setTarifas(tarifasRes.data || []);
            setHuerfanos(huerfanosRes.data || []);
            setHistorico(historicoRes.data || { registros: [], cierres: [] });
            setBi(biRes.data || {});
            setAuditoria(auditoriaRes.data || []);
        } catch (error) {
            console.error('Error cargando modulo administrador', error);
            alert('No se pudo cargar el modulo administrador. Verifique que el backend este activo.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarTodo();
    }, [anio, mes]);

    // CU-ADM-13: Exportacion simple a CSV compatible con Excel para contabilidad.
    const exportarHistoricoCsv = () => {
        const registros = historico.registros || [];
        const encabezado = ['id', 'placa', 'tipoVehiculo', 'fechaEntrada', 'fechaSalida', 'metodoPago', 'valorTotal'];
        const filas = registros.map((r) => [
            r.id,
            r.placa,
            r.tipo_vehiculo || r.tipoVehiculo,
            r.fecha_entrada || r.fechaEntrada,
            r.fecha_salida || r.fechaSalida,
            r.metodo_pago || r.metodoPago,
            r.valor_total || r.valorTotal
        ]);
        const csv = [encabezado, ...filas].map((fila) => fila.map((celda) => `"${celda ?? ''}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `historico-admin-${anio}-${String(mes).padStart(2, '0')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // CU-ADM-02/CU-ADM-03/CU-ADM-15: Crear usuario con rol y motivo auditable.
    const guardarUsuario = async (e) => {
        e.preventDefault();
        await ParqueaderolotService.guardarUsuarioAdmin(usuarioForm, responsable, 'Creacion o actualizacion desde panel administrador');
        setUsuarioForm({ nombre: '', apellido: '', correo: '', password: '', rol: 'OPERARIO' });
        cargarTodo();
    };

    // CU-ADM-04/CU-ADM-15: Guardar tarifa por tipo de vehiculo.
    const guardarTarifa = async (e) => {
        e.preventDefault();
        await ParqueaderolotService.guardarTarifaAdmin(tarifaForm, responsable, 'Actualizacion de tarifa desde panel administrador');
        cargarTodo();
    };

    // CU-ADM-08/CU-ADM-09/CU-ADM-10: Registrar cierre y congelar turno.
    const cerrarCaja = async (e) => {
        e.preventDefault();
        await ParqueaderolotService.crearCierreCajaAdmin(cierreForm);
        setCierreForm((prev) => ({ ...prev, efectivoDeclarado: 0, gastos: 0, motivoGastos: '' }));
        cargarTodo();
    };

    const totalHistorico = useMemo(() => formatoMoneda(historico.totalIngresos), [historico]);

    const renderResumen = (items = []) => (
        <div className="admin-list compact">
            {items.length === 0 && <p className="muted">Sin datos para el periodo.</p>}
            {items.map((item, index) => (
                <div className="admin-row" key={`${item.grupo}-${index}`}>
                    <span>{item.grupo}</span>
                    <strong>{item.total !== undefined ? formatoMoneda(item.total) : item.cantidad}</strong>
                </div>
            ))}
        </div>
    );

    return (
        <div className="admin-panel">
            <header className="admin-header">
                <div>
                    <p className="group-title">MODULO ADMINISTRADOR</p>
                    <h1>Casos de uso administrativos</h1>
                </div>
                <button className="admin-action ghost" onClick={cargarTodo} disabled={cargando}>
                    {cargando ? 'Actualizando...' : 'Actualizar'}
                </button>
            </header>

            <nav className="admin-tabs" aria-label="Secciones del administrador">
                {tabsAdmin.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`admin-tab ${tabActiva === tab.id ? 'active' : ''}`}
                        onClick={() => setTabActiva(tab.id)}
                    >
                        <i className={`${tab.icon} icon-inline`} />
                        {tab.label}
                    </button>
                ))}
            </nav>

            {tabActiva === 'resumen' && (
                <section className="admin-tab-panel">
                    <section className="admin-grid metrics">
                        <article className="admin-card"><span>Usuarios</span><strong>{dashboard.usuarios || 0}</strong></article>
                        <article className="admin-card"><span>Vehiculos activos</span><strong>{dashboard.vehiculosActivos || 0}</strong></article>
                        <article className="admin-card alert"><span>Registros huerfanos</span><strong>{dashboard.registrosHuerfanos || 0}</strong></article>
                        <article className="admin-card"><span>Ingresos hoy</span><strong>{formatoMoneda(dashboard.ingresosHoy)}</strong></article>
                    </section>

                    <section className="admin-grid two">
                        <article className="admin-card">
                            <h2>CU-ADM-06 / Registros huerfanos</h2>
                            <div className="admin-list">
                                {huerfanos.length === 0 && <p className="muted">No hay vehiculos activos por mas de 24 horas.</p>}
                                {huerfanos.map((r) => (
                                    <div className="admin-row danger" key={r.id}>
                                        <span>{r.placa}<small>{r.lugar_asignado || r.lugarAsignado} - {r.fecha_entrada || r.fechaEntrada}</small></span>
                                        <strong>{r.estado}</strong>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="admin-card">
                            <h2>CU-ADM-15 / Ultimos cambios</h2>
                            <div className="admin-list">
                                {auditoria.slice(0, 5).map((a) => (
                                    <div className="admin-row" key={a.id}>
                                        <span>{a.accion}<small>{a.usuario} - {a.motivo}</small></span>
                                        <strong>{a.entidad}</strong>
                                    </div>
                                ))}
                                {auditoria.length === 0 && <p className="muted">Sin cambios auditados todavía.</p>}
                            </div>
                        </article>
                    </section>
                </section>
            )}

            {tabActiva === 'tarifas' && (
                <section className="admin-card admin-tab-panel">
                    <div className="admin-section-bar">
                        <div>
                            <p className="group-title">CU-ADM-04</p>
                            <h2>Crear / actualizar tarifas</h2>
                        </div>
                        <span className="muted">Estas tarifas alimentan el POS de salida.</span>
                    </div>
                    <form className="admin-form tarifas-form" onSubmit={guardarTarifa}>
                        <label>
                            Tipo de vehiculo
                            <select value={tarifaForm.tipoVehiculo} onChange={(e) => setTarifaForm({ ...tarifaForm, tipoVehiculo: e.target.value })} required>
                                <option value="AUTOMOVIL">Automovil</option>
                                <option value="MOTOCICLETA">Motocicleta</option>
                                <option value="PESADO">Vehiculo pesado</option>
                            </select>
                        </label>
                        <label>
                            Valor por minuto
                            <input type="number" min="0" value={tarifaForm.valorMinuto} onChange={(e) => setTarifaForm({ ...tarifaForm, valorMinuto: Number(e.target.value) })} required />
                        </label>
                        <button className="admin-action" type="submit">Guardar tarifa</button>
                    </form>
                    <div className="admin-list tarifas-list">
                        {tarifas.map((t) => (
                            <div className="admin-row" key={t.id}>
                                <span>{t.tipoVehiculo}<small>Tarifa activa</small></span>
                                <strong>{formatoMoneda(t.valorMinuto)} / min</strong>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {tabActiva === 'usuarios' && (
                <section className="admin-card admin-tab-panel">
                    <h2>CU-ADM-02 / Usuarios y roles</h2>
                    <form className="admin-form" onSubmit={guardarUsuario}>
                        <input placeholder="Nombre" value={usuarioForm.nombre} onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: mayuscula(e.target.value) })} required />
                        <input placeholder="Apellido" value={usuarioForm.apellido} onChange={(e) => setUsuarioForm({ ...usuarioForm, apellido: mayuscula(e.target.value) })} required />
                        <input className="email-lowercase" placeholder="Correo" value={usuarioForm.correo} onChange={(e) => setUsuarioForm({ ...usuarioForm, correo: minuscula(e.target.value) })} required />
                        <input placeholder="Password" value={usuarioForm.password} onChange={(e) => setUsuarioForm({ ...usuarioForm, password: e.target.value })} required />
                        <select value={usuarioForm.rol} onChange={(e) => setUsuarioForm({ ...usuarioForm, rol: e.target.value })}>
                            {roles.map((rol) => <option key={rol} value={rol}>{rol}</option>)}
                        </select>
                        <button className="admin-action" type="submit">Guardar usuario</button>
                    </form>
                    <div className="admin-list">
                        {usuarios.map((u) => (
                            <div className="admin-row" key={u.id}>
                                <span>{u.nombre} {u.apellido}<small>{u.correo}</small></span>
                                <strong>{u.rol}</strong>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {tabActiva === 'caja' && (
                <section className="admin-card admin-tab-panel">
                    <h2>CU-ADM-08 / Cierre de caja</h2>
                    <form className="admin-form" onSubmit={cerrarCaja}>
                        <input type="number" placeholder="Base inicial" value={cierreForm.baseInicial} onChange={(e) => setCierreForm({ ...cierreForm, baseInicial: Number(e.target.value) })} />
                        <input type="number" placeholder="Efectivo declarado" value={cierreForm.efectivoDeclarado} onChange={(e) => setCierreForm({ ...cierreForm, efectivoDeclarado: Number(e.target.value) })} />
                        <input type="number" placeholder="Gastos / vales" value={cierreForm.gastos} onChange={(e) => setCierreForm({ ...cierreForm, gastos: Number(e.target.value) })} />
                        <input placeholder="Motivo de gastos" value={cierreForm.motivoGastos} onChange={(e) => setCierreForm({ ...cierreForm, motivoGastos: mayuscula(e.target.value) })} />
                        <button className="admin-action" type="submit">Congelar turno</button>
                    </form>
                </section>
            )}

            {tabActiva === 'reportes' && (
                <section className="admin-tab-panel">
                    <section className="admin-card">
                        <div className="admin-section-bar">
                            <h2>CU-ADM-11 / Historico contable</h2>
                            <div className="admin-filters">
                                <input type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))} />
                                <input type="number" min="1" max="12" value={mes} onChange={(e) => setMes(Number(e.target.value))} />
                                <button className="admin-action" onClick={exportarHistoricoCsv}>Exportar Excel/CSV</button>
                            </div>
                        </div>
                        <p className="admin-total">Total historico: <strong>{totalHistorico}</strong></p>
                        <div className="admin-list">
                            {(historico.registros || []).slice(0, 10).map((r) => (
                                <div className="admin-row" key={r.id}>
                                    <span>{r.placa}<small>{r.fecha_salida || r.fechaSalida}</small></span>
                                    <strong>{formatoMoneda(r.valor_total || r.valorTotal)}</strong>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="admin-grid two">
                        <article className="admin-card">
                            <h2>CU-ADM-14 / BI metodos de pago</h2>
                            {renderResumen(bi.metodosPago || [])}
                        </article>
                        <article className="admin-card">
                            <h2>Rentabilidad por tipo</h2>
                            {renderResumen(bi.rentabilidadPorTipo || [])}
                        </article>
                    </section>
                </section>
            )}

            {tabActiva === 'auditoria' && (
                <section className="admin-card admin-tab-panel">
                    <h2>CU-ADM-15 / Auditoria</h2>
                    <div className="admin-list">
                        {auditoria.map((a) => (
                            <div className="admin-row" key={a.id}>
                                <span>{a.accion}<small>{a.usuario} - {a.motivo}</small></span>
                                <strong>{a.entidad}</strong>
                            </div>
                        ))}
                        {auditoria.length === 0 && <p className="muted">Sin cambios auditados todavía.</p>}
                    </div>
                </section>
            )}
        </div>
    );
};

export default AdminPanel;
