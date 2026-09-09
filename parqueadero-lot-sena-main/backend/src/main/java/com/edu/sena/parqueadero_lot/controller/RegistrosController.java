package com.edu.sena.parqueadero_lot.controller;

import com.edu.sena.parqueadero_lot.Model.Registros;
import com.edu.sena.parqueadero_lot.Service.RegistrosService;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registros")
@CrossOrigin(origins = "*") 
public class RegistrosController {

    @Autowired
    private RegistrosService registrosService;
    
    /* --- 1. CONSULTAS --- */

    @GetMapping("/listar")
    public List<Registros> listarTodos() {
        return registrosService.listarTodos();        
    }

    @GetMapping("/activos")
    public List<Registros> listarActivos() {
        return registrosService.listarActivos();
    }

    /* --- 2. ENTRADA (REGISTRO) --- */

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Registros registro) {
        try {
            Registros nuevo = registrosService.guardar(registro);
            return ResponseEntity.ok(nuevo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /* --- 3. SALIDA (COBRO Y PAGO) --- */

    @PutMapping("/salida/placa/{placa}")
    public ResponseEntity<?> registrarSalidaPorPlaca(
            @PathVariable String placa,
            @RequestParam String metodoPago,
            @RequestParam(required = false) String transaccionId) {
        try {
            Registros actualizado = registrosService.registrarSalidaPorPlaca(placa, metodoPago, transaccionId);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /* --- 4. GESTIÓN Y EDICIÓN --- */

    @PutMapping("/{id}")
    public ResponseEntity<Registros> actualizar(@PathVariable Long id, @RequestBody Registros detalles) {
        return registrosService.buscarPorId(id)
            .map(registro -> {
                registro.setPlaca(detalles.getPlaca());
                registro.setTipoVehiculo(detalles.getTipoVehiculo());
                registro.setModelo(detalles.getModelo());
                registro.setColor(detalles.getColor());
                registro.setPropietarioNombre(detalles.getPropietarioNombre());
                registro.setPropietarioCedula(detalles.getPropietarioCedula());
                registro.setPropietarioTelefono(detalles.getPropietarioTelefono());
                registro.setLugarAsignado(detalles.getLugarAsignado());
                registro.setObservaciones(detalles.getObservaciones());
                
                registro.setFechaEntrada(detalles.getFechaEntrada());
                registro.setEstado(detalles.getEstado());
                
                registro.setMetodoPago(detalles.getMetodoPago());
                registro.setTransaccionId(detalles.getTransaccionId());
                
                // CORRECCIÓN: Se elimina registro.setValorTotal(detalles.getValorTotal()) 
                // para evitar sobrescribir el valor calculado por el Service.
                
                Registros actualizado = registrosService.guardar(registro);
                return ResponseEntity.ok(actualizado);
            }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        registrosService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}