package com.edu.sena.parqueadero_lot.Service;

import com.edu.sena.parqueadero_lot.Model.Vehiculos;
import com.edu.sena.parqueadero_lot.Repository.VehiculosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class VehiculosService {

    @Autowired
    private VehiculosRepository vehiculosRepository;

    // 1. GUARDAR: Registra un vehículo nuevo en la base de datos
    public Vehiculos guardar(Vehiculos vehiculo) {
        normalizarVehiculo(vehiculo);
        return vehiculosRepository.save(vehiculo);
    }

    // 2. LISTAR: Trae todos los vehículos registrados
    public List<Vehiculos> ListarVehiculos() {
        return vehiculosRepository.findAll();
    }

    // 3. BUSCAR POR ID: Útil para ediciones específicas
    public Optional<Vehiculos> buscarPorId(Long id) {
        return vehiculosRepository.findById(id);
    }

    // CU-OPER-01: Reutiliza los datos de un vehiculo ya registrado para agilizar ingresos futuros.
    public Optional<Vehiculos> buscarPorPlaca(String placa) {
        return vehiculosRepository.findByPlaca(mayuscula(placa));
    }

    // 4. ELIMINAR: Borra el registro por su ID primario
    public void eliminar(Long id) {
        vehiculosRepository.deleteById(id);
    }

    // 5. ACTUALIZAR: Lógica para modificar datos sin romper la relación con el Cliente
    public Vehiculos actualizar(Long id, Vehiculos vehiculoDetalles) {
        return vehiculosRepository.findById(id).map(vehiculoExistente -> {
            // Actualizamos los datos básicos
            vehiculoExistente.setPlaca(vehiculoDetalles.getPlaca());
            vehiculoExistente.setTipoVehiculo(vehiculoDetalles.getTipoVehiculo());
            vehiculoExistente.setMarca(vehiculoDetalles.getMarca());
            vehiculoExistente.setColor(vehiculoDetalles.getColor());
            vehiculoExistente.setModelo(vehiculoDetalles.getModelo());
            
            // IMPORTANTE: Mantenemos el vínculo con el dueño (Cliente)
            // Esto asegura que el vehículo no quede "huérfano" en la base de datos
            vehiculoExistente.setCliente(vehiculoDetalles.getCliente()); 
            normalizarVehiculo(vehiculoExistente);
            
            return vehiculosRepository.save(vehiculoExistente);
        }).orElseThrow(() -> new RuntimeException("Vehículo no encontrado con id " + id));
    }

    private void normalizarVehiculo(Vehiculos vehiculo) {
        if (vehiculo == null) return;
        vehiculo.setPlaca(mayuscula(vehiculo.getPlaca()));
        vehiculo.setTipoVehiculo(mayuscula(vehiculo.getTipoVehiculo()));
        vehiculo.setMarca(mayuscula(vehiculo.getMarca()));
        vehiculo.setColor(mayuscula(vehiculo.getColor()));
        vehiculo.setModelo(mayuscula(vehiculo.getModelo()));
    }

    private String mayuscula(String valor) {
        return valor == null ? null : valor.trim().toUpperCase();
    }
}
