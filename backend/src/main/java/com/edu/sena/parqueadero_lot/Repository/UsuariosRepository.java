package com.edu.sena.parqueadero_lot.Repository;

import com.edu.sena.parqueadero_lot.Model.Usuarios;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuariosRepository extends JpaRepository<Usuarios, Long> {
    
    // 1. Agregado para que UsuariosService deje de marcar error en 'buscarporCorreo'
    Optional<Usuarios> findByCorreo(String correo);

    // 2. NUEVO: Permite buscar dinámicamente a los usuarios según su rol asignado
    List<Usuarios> findByRol(String rol);
}