package com.edu.sena.parqueadero_lot.controller;

import com.edu.sena.parqueadero_lot.Model.Registros;
import com.edu.sena.parqueadero_lot.Model.Reserva;
import com.edu.sena.parqueadero_lot.Service.ReservaService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired private ReservaService reservaService;

    @GetMapping
    public List<Reserva> listarTodas() {
        return reservaService.listarTodas();
    }

    @GetMapping("/activas")
    public List<Reserva> listarActivas() {
        return reservaService.listarActivas();
    }

    @GetMapping("/cliente/{cedula}")
    public List<Reserva> listarPorCliente(@PathVariable String cedula) {
        return reservaService.listarPorCliente(cedula);
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<?> buscarPorCodigo(@PathVariable String codigo) {
        try {
            return ResponseEntity.ok(reservaService.buscarPorCodigo(codigo));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/placa/{placa}/activa")
    public ResponseEntity<?> buscarActivaPorPlaca(@PathVariable String placa) {
        try {
            return ResponseEntity.ok(reservaService.buscarActivaPorPlaca(placa));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody Reserva reserva) {
        try {
            return ResponseEntity.ok(reservaService.crearReserva(reserva));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/prorrogar")
    public ResponseEntity<?> prorrogar(
            @PathVariable Long id,
            @RequestParam(required = false) String metodoPago,
            @RequestParam(required = false) String referencia) {
        try {
            return ResponseEntity.ok(reservaService.prorrogar(id, metodoPago, referencia));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/confirmar-ingreso")
    public ResponseEntity<?> confirmarIngreso(@PathVariable Long id) {
        try {
            Registros registro = reservaService.confirmarIngreso(id);
            return ResponseEntity.ok(registro);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reservaService.cancelar(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
