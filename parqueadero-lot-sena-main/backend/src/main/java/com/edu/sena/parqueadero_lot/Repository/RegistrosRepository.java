package com.edu.sena.parqueadero_lot.Repository;

import com.edu.sena.parqueadero_lot.Model.Registros;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface RegistrosRepository extends JpaRepository<Registros, Long> {

    /**
     * 1. Para el Mapa de Ocupación:
     * Retorna la lista de vehículos para pintar los "cuadritos" en el Frontend.
     */
    List<Registros> findByEstado(String estado);

    /**
     * 2. CRUCIAL PARA LA SALIDA:
     * Busca el único registro "activo" de una placa. 
     * Esto asegura que cobremos el ingreso actual y no uno de ayer.
     */
    Optional<Registros> findByPlacaAndEstado(String placa, String estado);

    /**
     * 3. Para Auditoría y Clientes:
     * Permite ver el historial de un propietario específico.
     */
    List<Registros> findByPropietarioCedula(String propietarioCedula);

    /**
     * 4. Validación de Seguridad:
     * Evita que un operario ingrese dos veces la misma placa si el auto no ha salido.
     */
    boolean existsByPlacaAndEstado(String placa, String estado);

    // CU-ADM-06: Permite detectar registros huerfanos activos por mas de 24 horas.
    List<Registros> findByEstadoAndFechaEntradaBefore(String estado, LocalDateTime fechaLimite);

    // CU-ADM-11/CU-ADM-12: Base para reportes diarios, mensuales e historicos.
    List<Registros> findByFechaSalidaBetweenOrderByFechaSalidaDesc(LocalDateTime inicio, LocalDateTime fin);

    // CU-ADM-08/CU-ADM-09: Suma ingresos cerrados del rango auditado.
    @Query("select coalesce(sum(r.valorTotal), 0) from Registros r where r.fechaSalida between :inicio and :fin and r.estado = 'FINALIZADO'")
    BigDecimal sumarIngresosFinalizados(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // CU-ADM-14: Agrupa ingresos por metodo de pago para inteligencia de negocios.
    @Query("select r.metodoPago, count(r), coalesce(sum(r.valorTotal), 0) from Registros r where r.fechaSalida between :inicio and :fin and r.estado = 'FINALIZADO' group by r.metodoPago")
    List<Object[]> resumenPorMetodoPago(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // CU-ADM-14: Agrupa rentabilidad por tipo de vehiculo.
    @Query("select r.tipoVehiculo, count(r), coalesce(sum(r.valorTotal), 0) from Registros r where r.fechaSalida between :inicio and :fin and r.estado = 'FINALIZADO' group by r.tipoVehiculo")
    List<Object[]> resumenPorTipoVehiculo(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // CU-ADM-14: Calcula horas pico segun entradas registradas.
    @Query("select hour(r.fechaEntrada), count(r) from Registros r where r.fechaEntrada between :inicio and :fin group by hour(r.fechaEntrada) order by count(r) desc")
    List<Object[]> horasPico(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}
