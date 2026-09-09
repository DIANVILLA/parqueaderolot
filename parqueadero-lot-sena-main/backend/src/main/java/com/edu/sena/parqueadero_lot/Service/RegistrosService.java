package com.edu.sena.parqueadero_lot.Service;

import com.edu.sena.parqueadero_lot.Model.Registros;
import com.edu.sena.parqueadero_lot.Model.Usuarios;
import com.edu.sena.parqueadero_lot.Model.Cliente;
import com.edu.sena.parqueadero_lot.Model.Vehiculos;
import com.edu.sena.parqueadero_lot.Repository.RegistrosRepository;
import com.edu.sena.parqueadero_lot.Repository.ClienteRepository;
import com.edu.sena.parqueadero_lot.Repository.VehiculosRepository;
import com.edu.sena.parqueadero_lot.Repository.TarifaRepository;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistrosService {

    @Autowired private RegistrosRepository registrosRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private VehiculosRepository vehiculosRepository;
    @Autowired private TarifaRepository tarifaRepository;
    @Autowired private CorreoService correoService;
    @Autowired private UsuariosService usuariosService;

    @Value("${parqueadero.tarifa.minuto:50.0}")
    private double tarifaMinuto;

    /* --- MÉTODOS DE CONSULTA --- */

    public List<Registros> listarTodos() { return registrosRepository.findAll(); }

    public List<Registros> listarActivos() { return registrosRepository.findByEstado("ACTIVO"); }

    public Optional<Registros> buscarPorId(Long id) { return registrosRepository.findById(id); }

    /* --- MÉTODO GUARDAR CORREGIDO --- */

    @Transactional
    public Registros guardar(Registros registro) {
        normalizarRegistro(registro);
        if (registro.getPlaca() == null || registro.getPlaca().isEmpty()) {
            throw new RuntimeException("La placa es obligatoria.");
        }
        
        if (registrosRepository.existsByPlacaAndEstado(registro.getPlaca(), "ACTIVO")) {
            throw new RuntimeException("El vehículo con placa " + registro.getPlaca() + " ya está dentro.");
        }

        // 1. Gestión del Cliente: Buscar o Crear
        Cliente cliente = clienteRepository.findByIdentificacion(registro.getPropietarioCedula())
            .orElseGet(() -> {
                Cliente nuevoC = new Cliente();
                nuevoC.setIdentificacion(registro.getPropietarioCedula());
                nuevoC.setNombreCompleto(registro.getPropietarioNombre());
                nuevoC.setTelefono(registro.getPropietarioTelefono());
                return clienteRepository.save(nuevoC);
            });

        String marcaValida = normalizarMarca(registro.getMarca());
        registro.setMarca(marcaValida);

        // 2. Gestión del Vehículo: Buscar, actualizar o crear
        vehiculosRepository.findByPlaca(registro.getPlaca())
            .map(vehiculoExistente -> {
                vehiculoExistente.setTipoVehiculo(registro.getTipoVehiculo());
                vehiculoExistente.setModelo(registro.getModelo());
                vehiculoExistente.setColor(registro.getColor());
                vehiculoExistente.setMarca(marcaValida);
                vehiculoExistente.setCliente(cliente);
                return vehiculosRepository.save(vehiculoExistente);
            })
            .orElseGet(() -> {
                Vehiculos nuevoV = new Vehiculos();
                nuevoV.setPlaca(registro.getPlaca());
                nuevoV.setTipoVehiculo(registro.getTipoVehiculo());
                nuevoV.setModelo(registro.getModelo());
                nuevoV.setColor(registro.getColor());
                nuevoV.setMarca(marcaValida);
                nuevoV.setCliente(cliente); 
                return vehiculosRepository.save(nuevoV);
            });

        // 3. Guardar el Registro
        return registrosRepository.save(registro);
    }

    /* --- LÓGICA DE CÁLCULO Y SALIDAS (MANTENIDA) --- */

    public BigDecimal calcularCobro(LocalDateTime entrada, LocalDateTime salida) {
        return calcularCobro(entrada, salida, null);
    }

    // CU-ADM-04/CU-ADM-09: Usa tarifas administrativas por tipo de vehiculo para calcular el valor real.
    public BigDecimal calcularCobro(LocalDateTime entrada, LocalDateTime salida, String tipoVehiculo) {
        if (entrada == null || salida == null) return BigDecimal.ZERO;
        long minutos = Duration.between(entrada, salida).toMinutes();
        if (minutos <= 0) minutos = 1; 
        String tipoConsulta = normalizarTipoVehiculo(tipoVehiculo);
        BigDecimal tarifa = tarifaRepository.findByTipoVehiculoIgnoreCase(tipoConsulta)
                .map(t -> t.getValorMinuto())
                .orElse(BigDecimal.valueOf(tarifaMinuto));
        return BigDecimal.valueOf(minutos).multiply(tarifa);
    }

    public Registros registrarSalidaPorPlaca(String placa, String metodoPago, String transaccionId) {
        Registros registro = registrosRepository.findByPlacaAndEstado(mayuscula(placa), "ACTIVO")
            .orElseThrow(() -> new RuntimeException("No se encontró un vehículo activo con placa: " + placa));
        return procesarSalida(registro, metodoPago, transaccionId);
    }

    private Registros procesarSalida(Registros registro, String metodoPago, String transaccionId) {
        LocalDateTime fechaSalida = LocalDateTime.now();
        registro.setFechaSalida(fechaSalida);
        registro.setValorTotal(calcularCobro(registro.getFechaEntrada(), fechaSalida, registro.getTipoVehiculo()));
        String tipoConsulta = normalizarTipoVehiculo(registro.getTipoVehiculo());
        registro.setTarifaAplicada(tarifaRepository.findByTipoVehiculoIgnoreCase(tipoConsulta)
                .map(t -> t.getValorMinuto())
                .orElse(BigDecimal.valueOf(tarifaMinuto)));
        registro.setMetodoPago(metodoPago != null ? metodoPago : "Efectivo");
        registro.setTransaccionId(transaccionId);
        registro.setEstado("FINALIZADO");
        Registros guardado = registrosRepository.save(registro);
        enviarCorreoSalidaAsync(guardado);
        return guardado;
    }

    private void enviarCorreoSalidaAsync(Registros registro) {
        new Thread(() -> {
            try {
                List<Usuarios> empleadosDeTurno = usuariosService.buscarPorRol("OPERARIO");
                if (empleadosDeTurno != null && !empleadosDeTurno.isEmpty()) {
                    correoService.enviarCorreoOperario(empleadosDeTurno.get(0).getCorreo(), 
                        "Ticket de Salida - Placa: " + registro.getPlaca(), 
                        "Total: $" + registro.getValorTotal());
                }
            } catch (Exception e) { e.printStackTrace(); }
        }).start();
    }

    public void eliminar(Long id) { registrosRepository.deleteById(id); }

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

    private String normalizarMarca(String marca) {
        if (marca == null || marca.isBlank()) return "Sin especificar";
        String marcaLimpia = marca.trim();
        if (marcaLimpia.equalsIgnoreCase("Sin Marca")) return "Sin especificar";
        return marcaLimpia.toUpperCase();
    }

    private void normalizarRegistro(Registros registro) {
        if (registro == null) return;
        registro.setPlaca(mayuscula(registro.getPlaca()));
        registro.setTipoVehiculo(mayuscula(registro.getTipoVehiculo()));
        registro.setMarca(mayuscula(registro.getMarca()));
        registro.setModelo(mayuscula(registro.getModelo()));
        registro.setColor(mayuscula(registro.getColor()));
        registro.setPropietarioNombre(mayuscula(registro.getPropietarioNombre()));
        registro.setPropietarioCedula(mayuscula(registro.getPropietarioCedula()));
        registro.setPropietarioTelefono(mayuscula(registro.getPropietarioTelefono()));
        registro.setLugarAsignado(mayuscula(registro.getLugarAsignado()));
        registro.setEstado(mayuscula(registro.getEstado()));
        registro.setMetodoPago(mayuscula(registro.getMetodoPago()));
        registro.setTransaccionId(mayuscula(registro.getTransaccionId()));
        registro.setObservaciones(mayuscula(registro.getObservaciones()));
    }

    private String mayuscula(String valor) {
        return valor == null ? null : valor.trim().toUpperCase();
    }
}
