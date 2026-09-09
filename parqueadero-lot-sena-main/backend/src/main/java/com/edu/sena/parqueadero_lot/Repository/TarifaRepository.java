package com.edu.sena.parqueadero_lot.Repository;

import com.edu.sena.parqueadero_lot.Model.Tarifa;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TarifaRepository extends JpaRepository<Tarifa, Long> {
    Optional<Tarifa> findByTipoVehiculo(String tipoVehiculo);
    Optional<Tarifa> findByTipoVehiculoIgnoreCase(String tipoVehiculo);
}
