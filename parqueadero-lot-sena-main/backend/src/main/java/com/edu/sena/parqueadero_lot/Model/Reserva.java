package com.edu.sena.parqueadero_lot.Model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_reserva", unique = true, nullable = false, length = 40)
    private String codigoReserva;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "placa", nullable = false, length = 10)
    private String placa;

    @JsonProperty("tipo_vehiculo")
    @Column(name = "tipo_vehiculo", nullable = false, length = 20)
    private String tipoVehiculo;

    @Column(name = "marca", length = 50)
    private String marca;

    @Column(name = "modelo", length = 50)
    private String modelo;

    @Column(name = "color", length = 30)
    private String color;

    @JsonProperty("cliente_nombre")
    @Column(name = "cliente_nombre", nullable = false, length = 120)
    private String clienteNombre;

    @JsonProperty("cliente_cedula")
    @Column(name = "cliente_cedula", nullable = false, length = 30)
    private String clienteCedula;

    @JsonProperty("cliente_telefono")
    @Column(name = "cliente_telefono", length = 30)
    private String clienteTelefono;

    @JsonProperty("cliente_correo")
    @Column(name = "cliente_correo", length = 120)
    private String clienteCorreo;

    @JsonProperty("lugar_asignado")
    @Column(name = "lugar_asignado", nullable = false, length = 10)
    private String lugarAsignado;

    @JsonProperty("fecha_reserva")
    @Column(name = "fecha_reserva", nullable = false)
    private LocalDateTime fechaReserva;

    @JsonProperty("vence_en")
    @Column(name = "vence_en", nullable = false)
    private LocalDateTime venceEn;

    @JsonProperty("fecha_confirmacion")
    @Column(name = "fecha_confirmacion")
    private LocalDateTime fechaConfirmacion;

    @JsonProperty("prorrogas_usadas")
    @Column(name = "prorrogas_usadas")
    private Integer prorrogasUsadas = 0;

    @JsonProperty("valor_prorroga")
    @Column(name = "valor_prorroga", precision = 10, scale = 2)
    private BigDecimal valorProrroga = BigDecimal.ZERO;

    @JsonProperty("metodo_pago_prorroga")
    @Column(name = "metodo_pago_prorroga", length = 50)
    private String metodoPagoProrroga;

    @JsonProperty("referencia_prorroga")
    @Column(name = "referencia_prorroga", length = 120)
    private String referenciaProrroga;

    @JsonProperty("registro_id")
    @Column(name = "registro_id")
    private Long registroId;

    @PrePersist
    public void prePersist() {
        if (fechaReserva == null) fechaReserva = LocalDateTime.now();
        if (venceEn == null) venceEn = fechaReserva.plusMinutes(15);
        if (estado == null || estado.isBlank()) estado = "ACTIVA";
        if (prorrogasUsadas == null) prorrogasUsadas = 0;
        if (valorProrroga == null) valorProrroga = BigDecimal.ZERO;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigoReserva() { return codigoReserva; }
    public void setCodigoReserva(String codigoReserva) { this.codigoReserva = codigoReserva; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public String getTipoVehiculo() { return tipoVehiculo; }
    public void setTipoVehiculo(String tipoVehiculo) { this.tipoVehiculo = tipoVehiculo; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    public String getClienteCedula() { return clienteCedula; }
    public void setClienteCedula(String clienteCedula) { this.clienteCedula = clienteCedula; }
    public String getClienteTelefono() { return clienteTelefono; }
    public void setClienteTelefono(String clienteTelefono) { this.clienteTelefono = clienteTelefono; }
    public String getClienteCorreo() { return clienteCorreo; }
    public void setClienteCorreo(String clienteCorreo) { this.clienteCorreo = clienteCorreo; }
    public String getLugarAsignado() { return lugarAsignado; }
    public void setLugarAsignado(String lugarAsignado) { this.lugarAsignado = lugarAsignado; }
    public LocalDateTime getFechaReserva() { return fechaReserva; }
    public void setFechaReserva(LocalDateTime fechaReserva) { this.fechaReserva = fechaReserva; }
    public LocalDateTime getVenceEn() { return venceEn; }
    public void setVenceEn(LocalDateTime venceEn) { this.venceEn = venceEn; }
    public LocalDateTime getFechaConfirmacion() { return fechaConfirmacion; }
    public void setFechaConfirmacion(LocalDateTime fechaConfirmacion) { this.fechaConfirmacion = fechaConfirmacion; }
    public Integer getProrrogasUsadas() { return prorrogasUsadas; }
    public void setProrrogasUsadas(Integer prorrogasUsadas) { this.prorrogasUsadas = prorrogasUsadas; }
    public BigDecimal getValorProrroga() { return valorProrroga; }
    public void setValorProrroga(BigDecimal valorProrroga) { this.valorProrroga = valorProrroga; }
    public String getMetodoPagoProrroga() { return metodoPagoProrroga; }
    public void setMetodoPagoProrroga(String metodoPagoProrroga) { this.metodoPagoProrroga = metodoPagoProrroga; }
    public String getReferenciaProrroga() { return referenciaProrroga; }
    public void setReferenciaProrroga(String referenciaProrroga) { this.referenciaProrroga = referenciaProrroga; }
    public Long getRegistroId() { return registroId; }
    public void setRegistroId(Long registroId) { this.registroId = registroId; }
}
