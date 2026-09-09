package com.edu.sena.parqueadero_lot.Model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "clientes")
public class Cliente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String identificacion;

    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    private String telefono;

    @Column(name = "correo")
    private String correo;

    /* ==============================================================
        RELACIÓN: UN CLIENTE -> MUCHOS VEHICULOS
        mappedBy = "cliente": Debe coincidir exactamente con el nombre 
        del atributo en tu clase Vehiculos.java
       ============================================================== */
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Evita bucles infinitos en el JSON
    private List<Vehiculos> vehiculos = new ArrayList<>();

    // Constructor Vacío
    public Cliente() {}

    // Constructor con parámetros
    public Cliente(Long id, String identificacion, String nombreCompleto, String telefono) {
        this.id = id;
        this.identificacion = identificacion;
        this.nombreCompleto = nombreCompleto;
        this.telefono = telefono;
    }

    // ==============================================================
    // GETTERS Y SETTERS
    // ==============================================================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdentificacion() { return identificacion; }
    public void setIdentificacion(String identificacion) { this.identificacion = identificacion; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public List<Vehiculos> getVehiculos() { return vehiculos; }
    public void setVehiculos(List<Vehiculos> vehiculos) { this.vehiculos = vehiculos; }

    /* ==============================================================
        MÉTODO DE UTILIDAD: Para añadir vehículos sin errores
       ============================================================== */
    public void addVehiculo(Vehiculos vehiculo) {
        if (this.vehiculos == null) {
            this.vehiculos = new ArrayList<>();
        }
        this.vehiculos.add(vehiculo);
        vehiculo.setCliente(this); // <-- Sincronizado con tu setCliente en Vehiculos.java
    }
}
