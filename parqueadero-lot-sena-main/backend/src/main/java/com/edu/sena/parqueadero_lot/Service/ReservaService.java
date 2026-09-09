package com.edu.sena.parqueadero_lot.Service;

import com.edu.sena.parqueadero_lot.Model.Registros;
import com.edu.sena.parqueadero_lot.Model.Reserva;
import com.edu.sena.parqueadero_lot.Model.Cliente;
import com.edu.sena.parqueadero_lot.Model.Vehiculos;
import com.edu.sena.parqueadero_lot.Repository.ClienteRepository;
import com.edu.sena.parqueadero_lot.Repository.RegistrosRepository;
import com.edu.sena.parqueadero_lot.Repository.ReservaRepository;
import com.edu.sena.parqueadero_lot.Repository.VehiculosRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservaService {

    private static final List<String> ESTADOS_RESERVA_ACTIVA = List.of("ACTIVA", "PRORROGADA");
    private static final int MINUTOS_RESERVA = 15;
    private static final int MINUTOS_PRORROGA = 10;
    private static final BigDecimal VALOR_PRORROGA = BigDecimal.valueOf(1000);

    @Autowired private ReservaRepository reservaRepository;
    @Autowired private RegistrosRepository registrosRepository;
    @Autowired private RegistrosService registrosService;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private VehiculosRepository vehiculosRepository;

    public List<Reserva> listarTodas() {
        vencerReservasExpiradas();
        return reservaRepository.findAll();
    }

    public List<Reserva> listarActivas() {
        vencerReservasExpiradas();
        return reservaRepository.findByEstadoIn(ESTADOS_RESERVA_ACTIVA);
    }

    public List<Reserva> listarPorCliente(String cedula) {
        vencerReservasExpiradas();
        return reservaRepository.findByClienteCedulaOrderByFechaReservaDesc(mayuscula(cedula));
    }

    public Reserva buscarPorCodigo(String codigo) {
        vencerReservasExpiradas();
        return reservaRepository.findByCodigoReserva(mayuscula(codigo))
                .orElseThrow(() -> new RuntimeException("No se encontro la reserva."));
    }

    public Reserva buscarActivaPorPlaca(String placa) {
        vencerReservasExpiradas();
        return reservaRepository.findFirstByPlacaAndEstadoInOrderByFechaReservaDesc(mayuscula(placa), ESTADOS_RESERVA_ACTIVA)
                .orElseThrow(() -> new RuntimeException("No hay reserva activa para la placa."));
    }

    @Transactional
    public Reserva crearReserva(Reserva reserva) {
        vencerReservasExpiradas();
        normalizarReserva(reserva);

        if (reserva.getPlaca() == null || reserva.getPlaca().isBlank()) {
            throw new RuntimeException("La placa es obligatoria.");
        }
        if (registrosRepository.existsByPlacaAndEstado(reserva.getPlaca(), "ACTIVO")) {
            throw new RuntimeException("La placa ya tiene un ingreso activo.");
        }
        if (reservaRepository.existsByPlacaAndEstadoIn(reserva.getPlaca(), ESTADOS_RESERVA_ACTIVA)) {
            throw new RuntimeException("La placa ya tiene una reserva activa.");
        }

        registrarClienteYVehiculo(reserva);

        String lugar = obtenerSiguienteCupoDisponible(reserva.getTipoVehiculo());
        reserva.setLugarAsignado(lugar);
        reserva.setFechaReserva(LocalDateTime.now());
        reserva.setVenceEn(reserva.getFechaReserva().plusMinutes(MINUTOS_RESERVA));
        reserva.setEstado("ACTIVA");
        reserva.setProrrogasUsadas(0);
        reserva.setValorProrroga(BigDecimal.ZERO);
        reserva.setCodigoReserva(generarCodigoReserva(reserva));

        return reservaRepository.save(reserva);
    }

    private void registrarClienteYVehiculo(Reserva reserva) {
        Cliente cliente = clienteRepository.findByIdentificacion(reserva.getClienteCedula())
                .map(existente -> {
                    existente.setNombreCompleto(reserva.getClienteNombre());
                    existente.setTelefono(reserva.getClienteTelefono());
                    existente.setCorreo(reserva.getClienteCorreo());
                    return clienteRepository.save(existente);
                })
                .orElseGet(() -> {
                    Cliente nuevo = new Cliente();
                    nuevo.setIdentificacion(reserva.getClienteCedula());
                    nuevo.setNombreCompleto(reserva.getClienteNombre());
                    nuevo.setTelefono(reserva.getClienteTelefono());
                    nuevo.setCorreo(reserva.getClienteCorreo());
                    return clienteRepository.save(nuevo);
                });

        vehiculosRepository.findByPlaca(reserva.getPlaca())
                .map(existente -> {
                    existente.setTipoVehiculo(reserva.getTipoVehiculo());
                    existente.setMarca(reserva.getMarca());
                    existente.setColor(reserva.getColor());
                    existente.setModelo(reserva.getModelo());
                    existente.setCliente(cliente);
                    return vehiculosRepository.save(existente);
                })
                .orElseGet(() -> {
                    Vehiculos nuevo = new Vehiculos();
                    nuevo.setPlaca(reserva.getPlaca());
                    nuevo.setTipoVehiculo(reserva.getTipoVehiculo());
                    nuevo.setMarca(reserva.getMarca());
                    nuevo.setColor(reserva.getColor());
                    nuevo.setModelo(reserva.getModelo());
                    nuevo.setCliente(cliente);
                    return vehiculosRepository.save(nuevo);
                });
    }

    @Transactional
    public Reserva prorrogar(Long id, String metodoPago, String referencia) {
        vencerReservasExpiradas();
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontro la reserva."));

        if (!ESTADOS_RESERVA_ACTIVA.contains(reserva.getEstado())) {
            throw new RuntimeException("Solo se puede prorrogar una reserva activa.");
        }
        if (reserva.getProrrogasUsadas() != null && reserva.getProrrogasUsadas() >= 1) {
            throw new RuntimeException("La reserva ya uso la prorroga permitida.");
        }

        reserva.setEstado("PRORROGADA");
        reserva.setVenceEn(reserva.getVenceEn().plusMinutes(MINUTOS_PRORROGA));
        reserva.setProrrogasUsadas((reserva.getProrrogasUsadas() == null ? 0 : reserva.getProrrogasUsadas()) + 1);
        reserva.setValorProrroga(VALOR_PRORROGA);
        reserva.setMetodoPagoProrroga(mayuscula(metodoPago));
        reserva.setReferenciaProrroga(mayuscula(referencia));
        return reservaRepository.save(reserva);
    }

    @Transactional
    public Registros confirmarIngreso(Long id) {
        vencerReservasExpiradas();
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontro la reserva."));

        if (!ESTADOS_RESERVA_ACTIVA.contains(reserva.getEstado())) {
            throw new RuntimeException("La reserva no esta activa.");
        }
        if (LocalDateTime.now().isAfter(reserva.getVenceEn())) {
            reserva.setEstado("VENCIDA");
            reservaRepository.save(reserva);
            throw new RuntimeException("La reserva vencio y el cupo fue liberado.");
        }

        Registros registro = new Registros();
        registro.setPlaca(reserva.getPlaca());
        registro.setTipoVehiculo(reserva.getTipoVehiculo());
        registro.setMarca(reserva.getMarca());
        registro.setModelo(reserva.getModelo());
        registro.setColor(reserva.getColor());
        registro.setPropietarioNombre(reserva.getClienteNombre());
        registro.setPropietarioCedula(reserva.getClienteCedula());
        registro.setPropietarioTelefono(reserva.getClienteTelefono());
        registro.setLugarAsignado(reserva.getLugarAsignado());
        registro.setObservaciones("INGRESO CONFIRMADO DESDE RESERVA " + reserva.getCodigoReserva());

        Registros guardado = registrosService.guardar(registro);
        reserva.setEstado("CONFIRMADA");
        reserva.setFechaConfirmacion(LocalDateTime.now());
        reserva.setRegistroId(guardado.getId());
        reservaRepository.save(reserva);
        return guardado;
    }

    @Transactional
    public Reserva cancelar(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontro la reserva."));
        if (!ESTADOS_RESERVA_ACTIVA.contains(reserva.getEstado())) {
            throw new RuntimeException("Solo se puede cancelar una reserva activa.");
        }
        reserva.setEstado("CANCELADA");
        return reservaRepository.save(reserva);
    }

    @Transactional
    public void vencerReservasExpiradas() {
        List<Reserva> vencidas = reservaRepository.findByEstadoInAndVenceEnBefore(ESTADOS_RESERVA_ACTIVA, LocalDateTime.now());
        vencidas.forEach(reserva -> reserva.setEstado("VENCIDA"));
        if (!vencidas.isEmpty()) reservaRepository.saveAll(vencidas);
    }

    private String obtenerSiguienteCupoDisponible(String tipoVehiculo) {
        String tipo = normalizarTipoVehiculo(tipoVehiculo);
        String prefijo = tipo.equals("MOTOCICLETA") ? "B" : tipo.equals("PESADO") ? "C" : "A";

        Set<String> ocupados = new HashSet<>();
        registrosRepository.findByEstado("ACTIVO").forEach(registro -> {
            if (registro.getLugarAsignado() != null) ocupados.add(registro.getLugarAsignado().toUpperCase());
        });
        reservaRepository.findByEstadoIn(ESTADOS_RESERVA_ACTIVA).forEach(reserva -> {
            if (reserva.getLugarAsignado() != null) ocupados.add(reserva.getLugarAsignado().toUpperCase());
        });

        for (int i = 1; i <= 40; i++) {
            String cupo = prefijo + i;
            if (!ocupados.contains(cupo)) return cupo;
        }
        throw new RuntimeException("No hay cupos disponibles para " + tipo + ".");
    }

    private String generarCodigoReserva(Reserva reserva) {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "RES-" + fecha + "-" + reserva.getPlaca();
    }

    private void normalizarReserva(Reserva reserva) {
        reserva.setPlaca(mayuscula(reserva.getPlaca()));
        reserva.setTipoVehiculo(normalizarTipoVehiculo(reserva.getTipoVehiculo()));
        reserva.setMarca(mayuscula(reserva.getMarca()));
        reserva.setModelo(mayuscula(reserva.getModelo()));
        reserva.setColor(mayuscula(reserva.getColor()));
        reserva.setClienteNombre(mayuscula(reserva.getClienteNombre()));
        reserva.setClienteCedula(mayuscula(reserva.getClienteCedula()));
        reserva.setClienteTelefono(mayuscula(reserva.getClienteTelefono()));
        reserva.setClienteCorreo(minuscula(reserva.getClienteCorreo()));
    }

    private String normalizarTipoVehiculo(String tipoVehiculo) {
        String tipo = mayuscula(tipoVehiculo);
        if (tipo == null) return "AUTOMOVIL";
        tipo = tipo.replace("Á", "A").replace("É", "E").replace("Í", "I").replace("Ó", "O").replace("Ú", "U");
        if (tipo.contains("MOTO")) return "MOTOCICLETA";
        if (tipo.contains("PESADO") || tipo.contains("CARGA")) return "PESADO";
        return "AUTOMOVIL";
    }

    private String mayuscula(String valor) {
        return valor == null ? null : valor.trim().toUpperCase();
    }

    private String minuscula(String valor) {
        return valor == null ? null : valor.trim().toLowerCase();
    }
}
