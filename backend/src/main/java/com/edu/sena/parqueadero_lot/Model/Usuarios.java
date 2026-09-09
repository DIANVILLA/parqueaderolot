package com.edu.sena.parqueadero_lot.Model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;// herramienta para manejar la fecha de registro
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Table(name = "usuarios")
@Data
public class Usuarios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
   
  //correo que se usara para ingresar  
  @Column(nullable=false,unique=true, length=50)
  private String correo;       
    
  //contraseña de acceso, guardada como hash BCrypt (nunca se expone en las respuestas de la API)
  @Column(nullable=false,length=100)
  @JsonIgnore
  private String password;
  
 //nombre con el que se registra
 @Column(name = "nombres del usuario", nullable=false,length=20) 
    private String nombre;
 
  //apellido de usuario
  @Column(name = "apellido del usuario", nullable=false,length=20) 
    private String apellido;
  
  //rol
  @Column(name = "rol", nullable=false,length=20) 
    private String rol;
  
  //fecha de registro 
  @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;
  
  //captura la hora de registro 
  @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
}
}

