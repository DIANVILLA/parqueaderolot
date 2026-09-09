package com.edu.sena.parqueadero_lot.controller;

import com.edu.sena.parqueadero_lot.Model.CierreCaja;
import com.edu.sena.parqueadero_lot.Model.Tarifa;
import com.edu.sena.parqueadero_lot.Model.Usuarios;
import com.edu.sena.parqueadero_lot.Service.AdminService;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // CU-ADM-01/CU-ADM-05/CU-ADM-06/CU-ADM-14: Panel inicial del administrador.
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        return ResponseEntity.ok(adminService.dashboard());
    }

    // CU-ADM-01/CU-ADM-02: Roles oficiales del sistema.
    @GetMapping("/roles")
    public ResponseEntity<?> roles() {
        return ResponseEntity.ok(adminService.rolesSistema());
    }

    // CU-ADM-02/CU-ADM-03: Administracion de usuarios y roles.
    @GetMapping("/usuarios")
    public ResponseEntity<?> usuarios() {
        return ResponseEntity.ok(adminService.listarUsuarios());
    }

    // CU-ADM-02/CU-ADM-03/CU-ADM-15: Guardar usuarios dejando auditoria.
    @PostMapping("/usuarios")
    public ResponseEntity<?> guardarUsuario(
            @RequestBody Usuarios usuario,
            @RequestParam(defaultValue = "admin") String responsable,
            @RequestParam(defaultValue = "Gestion administrativa de usuario") String motivo) {
        return ResponseEntity.ok(adminService.guardarUsuario(usuario, responsable, motivo));
    }

    // CU-ADM-04: Gestion de tarifas por tipo de vehiculo.
    @GetMapping("/tarifas")
    public ResponseEntity<?> tarifas() {
        return ResponseEntity.ok(adminService.listarTarifas());
    }

    // CU-ADM-04/CU-ADM-15: Crear o actualizar tarifa con motivo auditable.
    @PostMapping("/tarifas")
    public ResponseEntity<?> guardarTarifa(
            @RequestBody Tarifa tarifa,
            @RequestParam(defaultValue = "admin") String responsable,
            @RequestParam(defaultValue = "Actualizacion de tarifa") String motivo) {
        return ResponseEntity.ok(adminService.guardarTarifa(tarifa, responsable, motivo));
    }

    // CU-ADM-06: Alerta de registros huerfanos activos por mas de 24 horas.
    @GetMapping("/alertas/registros-huerfanos")
    public ResponseEntity<?> registrosHuerfanos() {
        return ResponseEntity.ok(adminService.registrosHuerfanos());
    }

    // CU-ADM-08/CU-ADM-09/CU-ADM-10/CU-ADM-15: Cierre, conciliacion y congelamiento de turno.
    @PostMapping("/cierres-caja")
    public ResponseEntity<?> cerrarCaja(@RequestBody CierreCaja cierre) {
        return ResponseEntity.ok(adminService.cerrarCaja(cierre));
    }

    // CU-ADM-11/CU-ADM-12/CU-ADM-13: Historico por ano y mes para reportes y Excel.
    @GetMapping("/reportes/historico")
    public ResponseEntity<?> historico(
            @RequestParam(defaultValue = "0") int anio,
            @RequestParam(defaultValue = "0") int mes) {
        LocalDate hoy = LocalDate.now();
        int anioConsulta = anio == 0 ? hoy.getYear() : anio;
        int mesConsulta = mes == 0 ? hoy.getMonthValue() : mes;
        return ResponseEntity.ok(adminService.historico(anioConsulta, mesConsulta));
    }

    // CU-ADM-14: Inteligencia de negocios administrativa.
    @GetMapping("/reportes/bi")
    public ResponseEntity<?> bi(
            @RequestParam(defaultValue = "0") int anio,
            @RequestParam(defaultValue = "0") int mes) {
        LocalDate hoy = LocalDate.now();
        int anioConsulta = anio == 0 ? hoy.getYear() : anio;
        int mesConsulta = mes == 0 ? hoy.getMonthValue() : mes;
        return ResponseEntity.ok(adminService.bi(anioConsulta, mesConsulta));
    }

    // CU-ADM-15: Bitacora de auditoria inmutable.
    @GetMapping("/auditoria")
    public ResponseEntity<?> auditoria() {
        return ResponseEntity.ok(adminService.auditoria());
    }
}
