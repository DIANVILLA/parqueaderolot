import axios from 'axios';
import API_URL from './apiConfig';

class ParqueaderolotService {

    // --- MÉTODOS PARA USUARIOS ---
    listarUsuarios() {
        return axios.get(`${API_URL}/usuarios`); 
    }

    guardarUsuario(usuario) {
        return axios.post(`${API_URL}/usuarios`, usuario);
    }

    // CU-ADM-01/CU-ADM-02: Obtener roles oficiales del sistema.
    listarRolesAdmin() {
        return axios.get(`${API_URL}/admin/roles`);
    }

    // CU-ADM-05/CU-ADM-06/CU-ADM-14: Dashboard administrativo consolidado.
    obtenerDashboardAdmin() {
        return axios.get(`${API_URL}/admin/dashboard`);
    }

    // CU-ADM-02/CU-ADM-03: Gestion de usuarios desde el modulo administrador.
    listarUsuariosAdmin() {
        return axios.get(`${API_URL}/admin/usuarios`);
    }

    // CU-ADM-02/CU-ADM-03/CU-ADM-15: Guardar usuario con motivo para auditoria.
    guardarUsuarioAdmin(usuario, responsable = 'admin', motivo = 'Gestion administrativa de usuario') {
        return axios.post(`${API_URL}/admin/usuarios`, usuario, { params: { responsable, motivo } });
    }

    // CU-ADM-04: Gestion de tarifas por tipo de vehiculo.
    listarTarifasAdmin() {
        return axios.get(`${API_URL}/admin/tarifas`);
    }

    // CU-ADM-04/CU-ADM-15: Guardar tarifa con responsable y motivo.
    guardarTarifaAdmin(tarifa, responsable = 'admin', motivo = 'Actualizacion de tarifa') {
        return axios.post(`${API_URL}/admin/tarifas`, tarifa, { params: { responsable, motivo } });
    }

    // CU-ADM-06: Consultar registros huerfanos mayores a 24 horas.
    listarRegistrosHuerfanosAdmin() {
        return axios.get(`${API_URL}/admin/alertas/registros-huerfanos`);
    }

    // CU-ADM-08/CU-ADM-09/CU-ADM-10: Cierre, conciliacion y congelamiento de caja.
    crearCierreCajaAdmin(cierre) {
        return axios.post(`${API_URL}/admin/cierres-caja`, cierre);
    }

    // CU-ADM-11/CU-ADM-12/CU-ADM-13: Historico mensual para consulta y exportacion.
    obtenerHistoricoAdmin(anio, mes) {
        return axios.get(`${API_URL}/admin/reportes/historico`, { params: { anio, mes } });
    }

    // CU-ADM-14: Inteligencia de negocios administrativa.
    obtenerBiAdmin(anio, mes) {
        return axios.get(`${API_URL}/admin/reportes/bi`, { params: { anio, mes } });
    }

    // CU-ADM-15: Bitacora de auditoria.
    listarAuditoriaAdmin() {
        return axios.get(`${API_URL}/admin/auditoria`);
    }

    // --- MÉTODOS PARA VEHÍCULOS ---
    listarVehiculos() {
        return axios.get(`${API_URL}/vehiculos/Listar`);
    }

    // --- MÉTODOS PARA REGISTROS ---
    listarRegistros() {
        return axios.get(`${API_URL}/registros/Listar`);
    }

    // ============================================================
    // --- MÉTODOS PARA GESTIÓN DE ESPACIOS DE PARQUEADERO ---
    // ============================================================

    // Listar todos los espacios con su estado
    listarEspacios() {
        return axios.get(`${API_URL}/espacios-parqueo/listar`);
    }

    // Obtener espacios por tipo de vehículo
    listarEspaciosPorTipo(tipo) {
        return axios.get(`${API_URL}/espacios-parqueo/tipo/${tipo}`);
    }

    // Obtener espacios por estado
    listarEspaciosPorEstado(estado) {
        return axios.get(`${API_URL}/espacios-parqueo/estado/${estado}`);
    }

    // Buscar siguiente espacio disponible automáticamente
    siguienteEspacioDisponible(tipo) {
        return axios.get(`${API_URL}/espacios-parqueo/disponible/${tipo}`);
    }

    // Asignar espacio a un vehículo
    asignarEspacio(datos) {
        return axios.post(`${API_URL}/espacios-parqueo/asignar`, datos);
    }

    // Liberar espacio (cuando sale un vehículo)
    liberarEspacio(espacioId) {
        return axios.put(`${API_URL}/espacios-parqueo/${espacioId}/liberar`);
    }

    // Cambiar estado de un espacio (reservado, mantenimiento, etc)
    cambiarEstadoEspacio(espacioId, nuevoEstado) {
        return axios.put(`${API_URL}/espacios-parqueo/${espacioId}/estado`, { 
            estado: nuevoEstado 
        });
    }

    // Obtener historial de asignaciones de un espacio
    obtenerHistorialEspacio(espacioId) {
        return axios.get(`${API_URL}/espacios-parqueo/${espacioId}/historial`);
    }

    // ============================================================
    // --- MÉTODOS PARA PREFERENCIAS DE CLIENTES ---
    // ============================================================

    // Obtener preferencias de un cliente
    obtenerPreferenciasCliente(clienteId) {
        return axios.get(`${API_URL}/clientes/${clienteId}/preferencias`);
    }

    // Guardar preferencias de cliente
    guardarPreferenciasCliente(clienteId, datos) {
        return axios.post(`${API_URL}/clientes/${clienteId}/preferencias`, datos);
    }
}

// Exportamos la instancia para que sea accesible globalmente
export default new ParqueaderolotService();
