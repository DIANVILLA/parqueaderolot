package com.edu.sena.parqueadero_lot.Repository;

import com.edu.sena.parqueadero_lot.Model.CierreCaja;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CierreCajaRepository extends JpaRepository<CierreCaja, Long> {
    List<CierreCaja> findByFechaCierreBetweenOrderByFechaCierreDesc(LocalDateTime inicio, LocalDateTime fin);
}
