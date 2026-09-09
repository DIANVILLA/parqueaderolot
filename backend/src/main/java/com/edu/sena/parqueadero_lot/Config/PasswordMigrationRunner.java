package com.edu.sena.parqueadero_lot.Config;

import com.edu.sena.parqueadero_lot.Model.Usuarios;
import com.edu.sena.parqueadero_lot.Repository.UsuariosRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Migra contraseñas heredadas guardadas en texto plano a hash BCrypt.
 * Se ejecuta en cada arranque pero no hace nada una vez migradas
 * (detecta un hash existente por su prefijo "$2").
 */
@Component
public class PasswordMigrationRunner implements CommandLineRunner {

    private final UsuariosRepository usuariosRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordMigrationRunner(UsuariosRepository usuariosRepository, PasswordEncoder passwordEncoder) {
        this.usuariosRepository = usuariosRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        for (Usuarios usuario : usuariosRepository.findAll()) {
            String actual = usuario.getPassword();
            if (actual != null && !actual.startsWith("$2")) {
                usuario.setPassword(passwordEncoder.encode(actual));
                usuariosRepository.save(usuario);
            }
        }
    }
}
