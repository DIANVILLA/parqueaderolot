package com.edu.sena.parqueadero_lot.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class CorreoService {

    @Autowired
    private JavaMailSender despachador;

    public void enviarCorreoOperario(String destinatario, String asunto, String mensaje) {
        try {
            SimpleMailMessage correo = new SimpleMailMessage();
            correo.setTo(destinatario);
            correo.setSubject(asunto);
            correo.setText(mensaje);
            
            despachador.send(correo);
            System.out.println("✅ Correo enviado exitosamente a: " + destinatario);
        } catch (Exception e) {
            System.err.println("❌ Error al enviar el correo a " + destinatario + ": " + e.getMessage());
        }
    }
}