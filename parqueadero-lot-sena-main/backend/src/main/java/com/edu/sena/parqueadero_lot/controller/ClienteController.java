package com.edu.sena.parqueadero_lot.controller;

import com.edu.sena.parqueadero_lot.Model.Cliente;
import com.edu.sena.parqueadero_lot.Service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(originPatterns = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    /* ==============================================================
       1. LISTAR TODOS LOS CLIENTES
       ============================================================== */
    @GetMapping
    public List<Cliente> listarTodos() {
        return clienteService.listarTodos();
    }

    /* ==============================================================
       2. BUSCAR CLIENTE POR IDENTIFICACIÓN (Cédula)
       Este es el que usa React para el autollenado
       ============================================================== */
    @GetMapping("/buscar/{identificacion}")
    public ResponseEntity<Cliente> buscarPorIdentificacion(@PathVariable String identificacion) {
        return clienteService.buscarPorIdentificacion(identificacion)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ==============================================================
       3. GUARDAR/REGISTRAR CLIENTE CON VEHÍCULO EN CASCADA
       Esta es la pieza clave que conecta con el nuevo ClienteService
       ============================================================== */
    @PostMapping
    public ResponseEntity<Cliente> guardarCliente(@RequestBody Cliente cliente) {
        // Delegamos toda la lógica de búsqueda, vinculación y guardado al servicio
        Cliente guardado = clienteService.guardarClienteConVehiculo(cliente);
        return ResponseEntity.ok(guardado);
    }

    /* ==============================================================
       4. BUSCAR POR ID
       ============================================================== */
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtenerPorId(@PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ==============================================================
       5. ELIMINAR CLIENTE
       ============================================================== */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarCliente(@PathVariable Long id) {
        clienteService.eliminarCliente(id);
        return ResponseEntity.ok("Cliente eliminado con éxito");
    }
}
