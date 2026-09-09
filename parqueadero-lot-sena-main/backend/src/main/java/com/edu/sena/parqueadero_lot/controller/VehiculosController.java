package com.edu.sena.parqueadero_lot.controller;

import com.edu.sena.parqueadero_lot.Model.Vehiculos;
import com.edu.sena.parqueadero_lot.Service.VehiculosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehiculos")
@CrossOrigin(origins = "*")
public class VehiculosController {

    @Autowired
    private VehiculosService vehiculosService;

    @PostMapping("/guardar")
    public ResponseEntity<Vehiculos> guardarVehiculo(@RequestBody Vehiculos vehiculo) {
        Vehiculos nuevo = vehiculosService.guardar(vehiculo);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @GetMapping
    public ResponseEntity<List<Vehiculos>> listarTodos() {
        List<Vehiculos> lista = vehiculosService.ListarVehiculos();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/buscar/{placa}")
    public ResponseEntity<?> buscarPorPlaca(@PathVariable String placa) {
        return vehiculosService.buscarPorPlaca(placa.toUpperCase())
                .map(vehiculo -> {
                    var cliente = vehiculo.getCliente();
                    return ResponseEntity.ok(Map.of(
                            "placa", valorSeguro(vehiculo.getPlaca()),
                            "tipo_vehiculo", valorSeguro(vehiculo.getTipoVehiculo()),
                            "marca", valorSeguro(vehiculo.getMarca()),
                            "color", valorSeguro(vehiculo.getColor()),
                            "modelo", valorSeguro(vehiculo.getModelo()),
                            "propietario_cedula", cliente != null ? valorSeguro(cliente.getIdentificacion()) : "",
                            "propietario_nombre", cliente != null ? valorSeguro(cliente.getNombreCompleto()) : "",
                            "propietario_telefono", cliente != null ? valorSeguro(cliente.getTelefono()) : ""
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String valorSeguro(String valor) {
        return valor != null ? valor : "";
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVehiculo(@PathVariable Long id) {
        return vehiculosService.buscarPorId(id)
                .map(vehiculo -> {
                    vehiculosService.eliminar(id);
                    return new ResponseEntity<Void>(HttpStatus.OK);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehiculos> actualizarVehiculo(@PathVariable Long id, @RequestBody Vehiculos vehiculoDetalles) {
        try {
            Vehiculos actualizado = vehiculosService.actualizar(id, vehiculoDetalles);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
    
    
    
    
    
    
    
    
    
    
    
    

      

