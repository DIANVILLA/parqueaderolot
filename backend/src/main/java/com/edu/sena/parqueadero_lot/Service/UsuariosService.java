package com.edu.sena.parqueadero_lot.Service;

import com.edu.sena.parqueadero_lot.Model.Usuarios;
import com.edu.sena.parqueadero_lot.Repository.UsuariosRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuariosService {

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List <Usuarios> ListarTodos(){
        return usuariosRepository.findAll();
    }
    
    public Usuarios guardar(Usuarios usuarios){
        normalizarUsuario(usuarios);
        return usuariosRepository.save(usuarios);
    }
    
    public Optional<Usuarios> buscarporCorreo(String correo){
        return usuariosRepository.findByCorreo(minuscula(correo));
    }  
    
    public void eliminar(Long id) {
        usuariosRepository.deleteById(id);
    }
     
    public Optional<Usuarios> buscarPorId(Long id) {
        return usuariosRepository.findById(id);
    }

    public Usuarios actualizarUsuario(Long id, Usuarios usuarioActualizado) {
        return usuariosRepository.findById(id).map(usuario -> {
            usuario.setNombre(usuarioActualizado.getNombre());
            usuario.setApellido(usuarioActualizado.getApellido());
            usuario.setRol(usuarioActualizado.getRol());
            usuario.setCorreo(usuarioActualizado.getCorreo());
            usuario.setPassword(usuarioActualizado.getPassword()); 
            normalizarUsuario(usuario);
            return usuariosRepository.save(usuario);
        }).orElse(null);
    }

    public boolean validarLogin(String correo, String password) {
        return usuariosRepository.findByCorreo(minuscula(correo))
                .map(usuario -> passwordEncoder.matches(password, usuario.getPassword()))
                .orElse(false);
    }
    
    // ==============================================================
    // NUEVO: Método para buscar los correos de un rol en específico
    // ==============================================================
    public List<Usuarios> buscarPorRol(String rol) {
        return usuariosRepository.findByRol(mayuscula(rol));
    }

    private void normalizarUsuario(Usuarios usuario) {
        if (usuario == null) return;
        usuario.setNombre(mayuscula(usuario.getNombre()));
        usuario.setApellido(mayuscula(usuario.getApellido()));
        usuario.setRol(mayuscula(usuario.getRol()));
        usuario.setCorreo(minuscula(usuario.getCorreo()));
        // Evita re-hashear un hash BCrypt ya guardado (ej. al actualizar nombre/correo sin tocar la clave)
        String password = usuario.getPassword();
        if (password != null && !password.startsWith("$2")) {
            usuario.setPassword(passwordEncoder.encode(password));
        }
    }

    private String mayuscula(String valor) {
        return valor == null ? null : valor.trim().toUpperCase();
    }

    private String minuscula(String valor) {
        return valor == null ? null : valor.trim().toLowerCase();
    }
}






