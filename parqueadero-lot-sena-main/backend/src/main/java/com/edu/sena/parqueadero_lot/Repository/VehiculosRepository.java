package com.edu.sena.parqueadero_lot.Repository;

import com.edu.sena.parqueadero_lot.Model.Vehiculos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional; // ¡Este import es OBLIGATORIO!

@Repository
public interface VehiculosRepository extends JpaRepository<Vehiculos, Long> {
    
    // AGREGA ESTA LÍNEA AQUÍ DENTRO DE LA INTERFAZ
    Optional<Vehiculos> findByPlaca(String placa);
    
}