package com.edu.sena.parqueadero_lot.Repository;

import com.edu.sena.parqueadero_lot.Model.AuditoriaCambio;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaCambioRepository extends JpaRepository<AuditoriaCambio, Long> {
    List<AuditoriaCambio> findTop100ByOrderByFechaDesc();
}
