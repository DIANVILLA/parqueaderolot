package com.edu.sena.parqueadero_lot.Model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cierres_caja")
public class CierreCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "responsable_correo", nullable = false, length = 80)
    private String responsableCorreo;

    @Column(name = "responsable_rol", nullable = false, length = 30)
    private String responsableRol;

    @Column(name = "base_inicial", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseInicial = BigDecimal.ZERO;

    @Column(name = "efectivo_declarado", nullable = false, precision = 12, scale = 2)
    private BigDecimal efectivoDeclarado = BigDecimal.ZERO;

    @Column(name = "gastos", nullable = false, precision = 12, scale = 2)
    private BigDecimal gastos = BigDecimal.ZERO;

    @Column(name = "motivo_gastos", length = 255)
    private String motivoGastos;

    @Column(name = "efectivo_sistema", nullable = false, precision = 12, scale = 2)
    private BigDecimal efectivoSistema = BigDecimal.ZERO;

    @Column(name = "total_ingresos", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalIngresos = BigDecimal.ZERO;

    @Column(name = "diferencia", nullable = false, precision = 12, scale = 2)
    private BigDecimal diferencia = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String estado = "ABIERTO";

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @PrePersist
    protected void marcarFecha() {
        if (this.fechaCierre == null) {
            this.fechaCierre = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getResponsableCorreo() { return responsableCorreo; }
    public void setResponsableCorreo(String responsableCorreo) { this.responsableCorreo = responsableCorreo; }

    public String getResponsableRol() { return responsableRol; }
    public void setResponsableRol(String responsableRol) { this.responsableRol = responsableRol; }

    public BigDecimal getBaseInicial() { return baseInicial; }
    public void setBaseInicial(BigDecimal baseInicial) { this.baseInicial = baseInicial; }

    public BigDecimal getEfectivoDeclarado() { return efectivoDeclarado; }
    public void setEfectivoDeclarado(BigDecimal efectivoDeclarado) { this.efectivoDeclarado = efectivoDeclarado; }

    public BigDecimal getGastos() { return gastos; }
    public void setGastos(BigDecimal gastos) { this.gastos = gastos; }

    public String getMotivoGastos() { return motivoGastos; }
    public void setMotivoGastos(String motivoGastos) { this.motivoGastos = motivoGastos; }

    public BigDecimal getEfectivoSistema() { return efectivoSistema; }
    public void setEfectivoSistema(BigDecimal efectivoSistema) { this.efectivoSistema = efectivoSistema; }

    public BigDecimal getTotalIngresos() { return totalIngresos; }
    public void setTotalIngresos(BigDecimal totalIngresos) { this.totalIngresos = totalIngresos; }

    public BigDecimal getDiferencia() { return diferencia; }
    public void setDiferencia(BigDecimal diferencia) { this.diferencia = diferencia; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
}
