package com.edu.sena.parqueadero_lot.Model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "vehiculos")
public class Vehiculos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String placa;

    private String tipoVehiculo;
    private String marca;
    private String color;
    private String modelo;

    /* ==============================================================
       BLOQUE DE CONEXIÓN: Llave Foránea a Cliente 
       ============================================================== */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id") 
    @JsonBackReference // 👈 EL ESCUDO OBLIGATORIO CONTRA EL ERROR 415
    private Cliente cliente;

    // Constructor Vacío Obligatorio para Jackson
    public Vehiculos() {}

    // ==============================================================
    // GETTERS Y SETTERS
    // ==============================================================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getTipoVehiculo() { return tipoVehiculo; }
    public void setTipoVehiculo(String tipoVehiculo) { this.tipoVehiculo = tipoVehiculo; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
}