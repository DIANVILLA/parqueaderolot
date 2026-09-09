package com.edu.sena.parqueadero_lot.Repository;

import com.edu.sena.parqueadero_lot.Model.Reserva;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByEstadoIn(Collection<String> estados);
    List<Reserva> findByClienteCedulaOrderByFechaReservaDesc(String clienteCedula);
    Optional<Reserva> findByCodigoReserva(String codigoReserva);
    Optional<Reserva> findFirstByPlacaAndEstadoInOrderByFechaReservaDesc(String placa, Collection<String> estados);
    boolean existsByPlacaAndEstadoIn(String placa, Collection<String> estados);
    List<Reserva> findByEstadoInAndVenceEnBefore(Collection<String> estados, LocalDateTime fechaLimite);
}
