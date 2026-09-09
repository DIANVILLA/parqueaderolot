package com.edu.sena.parqueadero_lot.controller;

import com.edu.sena.parqueadero_lot.Model.Usuarios;
import com.edu.sena.parqueadero_lot.Service.UsuariosService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/usuarios")
public class UsuariosController {
    
    @Autowired
    private UsuariosService usuariosService;
    
    @GetMapping
    public ResponseEntity<List<Usuarios>> Listar(){
        List<Usuarios> lista = usuariosService.ListarTodos();
        return ResponseEntity.ok(lista);
    }
    
    @PostMapping
    public ResponseEntity<Usuarios> guardar(@RequestBody Usuarios usuario) {
        Usuarios nuevo = usuariosService.guardar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    } 

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuariosService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String correo = credenciales.get("username"); 
        String password = credenciales.get("password");  

        boolean esValido = usuariosService.validarLogin(correo, password);

        if (esValido) {
            return usuariosService.buscarporCorreo(correo)
                    .map(usuario -> ResponseEntity.ok(Map.of(
                            "mensaje", "Acceso concedido",
                            "usuario", usuario
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "Usuario o password incorrectos")));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body(Map.of("error", "Usuario o password incorrectos"));
        }
    } 
    
    @PutMapping("/{id}")
    public ResponseEntity<Usuarios> actualizar(@PathVariable Long id, @RequestBody Usuarios detallesUsuario) {
        try {
            return usuariosService.buscarPorId(id)
                    .map(usuario -> {
                        usuario.setNombre(detallesUsuario.getNombre());
                        usuario.setCorreo(detallesUsuario.getCorreo());
                        Usuarios actualizado = usuariosService.guardar(usuario);
                        return ResponseEntity.ok(actualizado);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


