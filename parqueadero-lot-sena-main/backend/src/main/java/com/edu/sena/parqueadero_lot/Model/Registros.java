package com.edu.sena.parqueadero_lot.Model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros")
@NoArgsConstructor
@AllArgsConstructor
public class Registros {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "placa", nullable = false, length = 10)
    private String placa;

    @JsonProperty("tipo_vehiculo")
    @Column(name = "tipo_vehiculo", length = 20)
    private String tipoVehiculo;
    
    @JsonProperty("marca")
    @JsonAlias({"marca", "marca_vehiculo", "marcaDelVehiculo", "MARCA DEL VEHICULO"})
    @Column(name = "marca", length = 50)
    private String marca;

    @Column(name = "modelo", length = 50)
    private String modelo;

    @Column(name = "color", length = 20)
    private String color;

    @JsonProperty("propietario_nombre")
    @Column(name = "propietario_nombre", length = 100)
    private String propietarioNombre;

    @JsonProperty("propietario_cedula")
    @Column(name = "propietario_cedula", length = 20)
    private String propietarioCedula;

    @JsonProperty("propietario_telefono")
    @Column(name = "propietario_telefono", length = 20)
    private String propietarioTelefono;

    @JsonProperty("lugar_asignado")
    @Column(name = "lugar_asignado", length = 10)
    private String lugarAsignado;

    @JsonProperty("fecha_entrada")
    @Column(name = "fecha_entrada")
    private LocalDateTime fechaEntrada;

    @JsonProperty("fecha_salida")
    @Column(name = "fecha_salida")
    private LocalDateTime fechaSalida;

    @Column(length = 20)
    private String estado;

    // --- NUEVOS CAMPOS DE AUDITORÍA Y COBROS ---
    @JsonProperty("tiempo_total_minutos")
    @Column(name = "tiempo_total_minutos")
    private Long tiempoTotalMinutos;

    @JsonProperty("tarifa_aplicada")
    @Column(name = "tarifa_aplicada", precision = 10, scale = 2)
    private BigDecimal tarifaAplicada;

    @JsonProperty("valor_total")
    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal;
    // -------------------------------------------

    @JsonProperty("metodo_pago")
    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @JsonProperty("transaccion_id")
    @Column(name = "transaccion_id", length = 100)
    private String transaccionId;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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
    
    public String getPropietarioNombre() { return propietarioNombre; }
    public void setPropietarioNombre(String propietarioNombre) { this.propietarioNombre = propietarioNombre; }
    
    public String getPropietarioCedula() { return propietarioCedula; }
    public void setPropietarioCedula(String propietarioCedula) { this.propietarioCedula = propietarioCedula; }
    
    public String getPropietarioTelefono() { return propietarioTelefono; }
    public void setPropietarioTelefono(String propietarioTelefono) { this.propietarioTelefono = propietarioTelefono; }
    
    public String getLugarAsignado() { return lugarAsignado; }
    public void setLugarAsignado(String lugarAsignado) { this.lugarAsignado = lugarAsignado; }
    
    public LocalDateTime getFechaEntrada() { return fechaEntrada; }
    public void setFechaEntrada(LocalDateTime fechaEntrada) { this.fechaEntrada = fechaEntrada; }
    
    public LocalDateTime getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(LocalDateTime fechaSalida) { this.fechaSalida = fechaSalida; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    // Getters y Setters de los nuevos campos
    public Long getTiempoTotalMinutos() { return tiempoTotalMinutos; }
    public void setTiempoTotalMinutos(Long tiempoTotalMinutos) { this.tiempoTotalMinutos = tiempoTotalMinutos; }

    public BigDecimal getTarifaAplicada() { return tarifaAplicada; }
    public void setTarifaAplicada(BigDecimal tarifaAplicada) { this.tarifaAplicada = tarifaAplicada; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
    
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    
    public String getTransaccionId() { return transaccionId; }
    public void setTransaccionId(String transaccionId) { this.transaccionId = transaccionId; }
    
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    @PrePersist 
    protected void onEntry() {
        this.fechaEntrada = LocalDateTime.now();
        this.estado = "ACTIVO";
        this.valorTotal = BigDecimal.ZERO;
    }
}
