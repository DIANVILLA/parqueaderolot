package com.edu.sena.parqueadero_lot.Service;

import com.edu.sena.parqueadero_lot.Model.AuditoriaCambio;
import com.edu.sena.parqueadero_lot.Model.CierreCaja;
import com.edu.sena.parqueadero_lot.Model.Registros;
import com.edu.sena.parqueadero_lot.Model.Tarifa;
import com.edu.sena.parqueadero_lot.Model.Usuarios;
import com.edu.sena.parqueadero_lot.Repository.AuditoriaCambioRepository;
import com.edu.sena.parqueadero_lot.Repository.CierreCajaRepository;
import com.edu.sena.parqueadero_lot.Repository.RegistrosRepository;
import com.edu.sena.parqueadero_lot.Repository.TarifaRepository;
import com.edu.sena.parqueadero_lot.Repository.UsuariosRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    @Autowired private UsuariosRepository usuariosRepository;
    @Autowired private RegistrosRepository registrosRepository;
    @Autowired private TarifaRepository tarifaRepository;
    @Autowired private CierreCajaRepository cierreCajaRepository;
    @Autowired private AuditoriaCambioRepository auditoriaCambioRepository;

    // CU-ADM-01/CU-ADM-02: Valida que los roles centrales existan como referencia del modulo.
    public List<String> rolesSistema() {
        return List.of("CLIENTE", "ADMINISTRADOR", "OPERARIO", "CONTADOR", "CAJERO");
    }

    // CU-ADM-05/CU-ADM-06/CU-ADM-14: Resume la salud operativa para el dashboard administrativo.
    public Map<String, Object> dashboard() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicio = hoy.atStartOfDay();
        LocalDateTime fin = hoy.atTime(LocalTime.MAX);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("roles", rolesSistema());
        data.put("usuarios", usuariosRepository.count());
        data.put("vehiculosActivos", registrosRepository.findByEstado("ACTIVO").size());
        data.put("registrosHuerfanos", registrosHuerfanos().size());
        data.put("ingresosHoy", registrosRepository.sumarIngresosFinalizados(inicio, fin));
        data.put("metodosPagoHoy", resumenFilas(registrosRepository.resumenPorMetodoPago(inicio, fin)));
        data.put("rentabilidadPorTipoHoy", resumenFilas(registrosRepository.resumenPorTipoVehiculo(inicio, fin)));
        return data;
    }

    // CU-ADM-02/CU-ADM-03: Lista usuarios para administracion de cuentas y roles.
    public List<Usuarios> listarUsuarios() {
        return usuariosRepository.findAll();
    }

    // CU-ADM-02/CU-ADM-03: Guarda usuario y registra auditoria del cambio administrativo.
    @Transactional
    public Usuarios guardarUsuario(Usuarios usuario, String responsable, String motivo) {
        normalizarUsuario(usuario);
        Usuarios guardado = usuariosRepository.save(usuario);
        auditar(responsable, "ADMINISTRADOR", "USUARIOS", String.valueOf(guardado.getId()),
                "GUARDAR_USUARIO", "USUARIO/ROL ACTUALIZADO: " + guardado.getCorreo(), motivo);
        return guardado;
    }

    // CU-ADM-04: Permite administrar tarifas que luego deben alimentar el cobro operativo.
    @Transactional
    public Tarifa guardarTarifa(Tarifa tarifa, String responsable, String motivo) {
        String tipoCanonico = normalizarTipoVehiculo(tarifa.getTipoVehiculo());
        Tarifa normalizada = tarifaRepository.findByTipoVehiculoIgnoreCase(tipoCanonico)
                .orElse(tarifa);
        normalizada.setTipoVehiculo(tipoCanonico);
        normalizada.setValorMinuto(tarifa.getValorMinuto());
        normalizada.setActiva(tarifa.getActiva() == null || tarifa.getActiva());
        Tarifa guardada = tarifaRepository.save(normalizada);
        auditar(responsable, "ADMINISTRADOR", "Tarifa", String.valueOf(guardada.getId()),
                "ACTUALIZAR_TARIFA", "Tarifa " + guardada.getTipoVehiculo() + " = " + guardada.getValorMinuto(), motivo);
        return guardada;
    }

    // CU-ADM-04: Consulta las tarifas vigentes configuradas.
    public List<Tarifa> listarTarifas() {
        crearTarifasBaseSiFaltan();
        return tarifaRepository.findAll();
    }

    // CU-ADM-06: Ubica vehiculos activos con mas de 24 horas sin salida registrada.
    public List<Registros> registrosHuerfanos() {
        return registrosRepository.findByEstadoAndFechaEntradaBefore("ACTIVO", LocalDateTime.now().minusHours(24));
    }

    // CU-ADM-08/CU-ADM-09/CU-ADM-10: Crea el cierre de caja, calcula diferencia y congela el turno.
    @Transactional
    public CierreCaja cerrarCaja(CierreCaja cierre) {
        normalizarCierre(cierre);
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicio = hoy.atStartOfDay();
        LocalDateTime fin = hoy.atTime(LocalTime.MAX);

        BigDecimal totalSistema = registrosRepository.sumarIngresosFinalizados(inicio, fin);
        BigDecimal efectivoEsperado = totalSistema.add(nvl(cierre.getBaseInicial())).subtract(nvl(cierre.getGastos()));

        cierre.setTotalIngresos(totalSistema);
        cierre.setEfectivoSistema(efectivoEsperado);
        cierre.setDiferencia(nvl(cierre.getEfectivoDeclarado()).subtract(efectivoEsperado));
        cierre.setEstado("CONGELADO");

        CierreCaja guardado = cierreCajaRepository.save(cierre);
        auditar(cierre.getResponsableCorreo(), cierre.getResponsableRol(), "CIERRE_CAJA", String.valueOf(guardado.getId()),
                "CONGELAR_TURNO", "DIFERENCIA DE CAJA: " + guardado.getDiferencia(), "CIERRE ADMINISTRATIVO DE TURNO");
        return guardado;
    }

    // CU-ADM-11/CU-ADM-12: Consulta historico por ano y mes para contabilidad.
    public Map<String, Object> historico(int anio, int mes) {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicio = ym.atDay(1).atStartOfDay();
        LocalDateTime fin = ym.atEndOfMonth().atTime(LocalTime.MAX);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("anio", anio);
        data.put("mes", mes);
        data.put("registros", registrosRepository.findByFechaSalidaBetweenOrderByFechaSalidaDesc(inicio, fin));
        data.put("cierres", cierreCajaRepository.findByFechaCierreBetweenOrderByFechaCierreDesc(inicio, fin));
        data.put("totalIngresos", registrosRepository.sumarIngresosFinalizados(inicio, fin));
        return data;
    }

    // CU-ADM-14: Reporte BI para horas pico, rentabilidad y medios de pago.
    public Map<String, Object> bi(int anio, int mes) {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicio = ym.atDay(1).atStartOfDay();
        LocalDateTime fin = ym.atEndOfMonth().atTime(LocalTime.MAX);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("metodosPago", resumenFilas(registrosRepository.resumenPorMetodoPago(inicio, fin)));
        data.put("rentabilidadPorTipo", resumenFilas(registrosRepository.resumenPorTipoVehiculo(inicio, fin)));
        data.put("horasPico", resumenFilas(registrosRepository.horasPico(inicio, fin)));
        return data;
    }

    // CU-ADM-15: Expone la bitacora inmutable de cambios administrativos.
    public List<AuditoriaCambio> auditoria() {
        return auditoriaCambioRepository.findTop100ByOrderByFechaDesc();
    }

    private void auditar(String usuario, String rol, String entidad, String entidadId, String accion, String detalle, String motivo) {
        AuditoriaCambio auditoria = new AuditoriaCambio();
        auditoria.setUsuario(usuario == null || usuario.isBlank() ? "sistema" : usuario.trim().toLowerCase());
        auditoria.setRol(rol == null || rol.isBlank() ? "ADMINISTRADOR" : mayuscula(rol));
        auditoria.setEntidad(mayuscula(entidad));
        auditoria.setEntidadId(mayuscula(entidadId));
        auditoria.setAccion(mayuscula(accion));
        auditoria.setDetalle(mayuscula(detalle));
        auditoria.setMotivo(motivo == null || motivo.isBlank() ? "NO INFORMADO" : mayuscula(motivo));
        auditoriaCambioRepository.save(auditoria);
    }

    private BigDecimal nvl(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }

    // CU-ADM-04: Semilla inicial para que salida y administracion tengan una sola fuente de tarifas.
    private void crearTarifasBaseSiFaltan() {
        crearTarifaBase("AUTOMOVIL", BigDecimal.valueOf(50));
        crearTarifaBase("MOTOCICLETA", BigDecimal.valueOf(30));
        crearTarifaBase("PESADO", BigDecimal.valueOf(70));
    }

    private void crearTarifaBase(String tipoVehiculo, BigDecimal valorMinuto) {
        tarifaRepository.findByTipoVehiculoIgnoreCase(tipoVehiculo).orElseGet(() -> {
            Tarifa tarifa = new Tarifa();
            tarifa.setTipoVehiculo(tipoVehiculo);
            tarifa.setValorMinuto(valorMinuto);
            tarifa.setActiva(true);
            return tarifaRepository.save(tarifa);
        });
    }

    private String normalizarTipoVehiculo(String tipoVehiculo) {
        if (tipoVehiculo == null) return "AUTOMOVIL";
        String tipo = tipoVehiculo.trim().toUpperCase()
                .replace("Á", "A")
                .replace("É", "E")
                .replace("Í", "I")
                .replace("Ó", "O")
                .replace("Ú", "U");
        if (tipo.contains("MOTO")) return "MOTOCICLETA";
        if (tipo.contains("PESADO") || tipo.contains("CARGA")) return "PESADO";
        return "AUTOMOVIL";
    }

    private void normalizarUsuario(Usuarios usuario) {
        if (usuario == null) return;
        usuario.setNombre(mayuscula(usuario.getNombre()));
        usuario.setApellido(mayuscula(usuario.getApellido()));
        usuario.setRol(mayuscula(usuario.getRol()));
        usuario.setCorreo(usuario.getCorreo() == null ? null : usuario.getCorreo().trim().toLowerCase());
    }

    private void normalizarCierre(CierreCaja cierre) {
        if (cierre == null) return;
        cierre.setResponsableCorreo(cierre.getResponsableCorreo() == null ? null : cierre.getResponsableCorreo().trim().toLowerCase());
        cierre.setResponsableRol(mayuscula(cierre.getResponsableRol()));
        cierre.setMotivoGastos(mayuscula(cierre.getMotivoGastos()));
        cierre.setEstado(mayuscula(cierre.getEstado()));
    }

    private String mayuscula(String valor) {
        return valor == null ? null : valor.trim().toUpperCase();
    }

    private List<Map<String, Object>> resumenFilas(List<Object[]> filas) {
        return filas.stream().map(fila -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("grupo", fila[0] == null ? "SIN_DATO" : fila[0]);
            item.put("cantidad", fila.length > 1 ? fila[1] : 0);
            item.put("total", fila.length > 2 ? fila[2] : 0);
            return item;
        }).toList();
    }
}
