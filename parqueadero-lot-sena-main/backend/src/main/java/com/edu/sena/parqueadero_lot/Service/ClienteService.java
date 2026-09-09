package com.edu.sena.parqueadero_lot.Service;

import com.edu.sena.parqueadero_lot.Model.Cliente;
import com.edu.sena.parqueadero_lot.Model.Vehiculos;
import com.edu.sena.parqueadero_lot.Repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    /* ==============================================================
        1. OBTENER CLIENTE POR IDENTIFICACIÓN
       ============================================================== */
    public Optional<Cliente> buscarPorIdentificacion(String identificacion) {
        return clienteRepository.findByIdentificacion(identificacion);
    }

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    /* ==============================================================
        2. LÓGICA AUTOMÁTICA DE REGISTRO EN CASCADA
       ============================================================== */
    @Transactional
    public Cliente guardarClienteConVehiculo(Cliente clienteData) {
        normalizarCliente(clienteData);
        // 1. Buscamos si el cliente ya existe por su identificación
        Optional<Cliente> clienteExistenteOpt = clienteRepository.findByIdentificacion(clienteData.getIdentificacion());

        Cliente clienteFinal;

        if (clienteExistenteOpt.isPresent()) {
            // Si el cliente ya existe, lo recuperamos y actualizamos sus datos
            clienteFinal = clienteExistenteOpt.get();
            clienteFinal.setNombreCompleto(clienteData.getNombreCompleto());
            clienteFinal.setTelefono(clienteData.getTelefono());
            clienteFinal.setCorreo(clienteData.getCorreo());
        } else {
            // Si es nuevo, lo preparamos para guardar
            clienteFinal = clienteData;
        }

        // 2. Gestionamos los vehículos que vienen en la lista
        // Esto crea el vínculo automático con el cliente (nuevo o existente)
        if (clienteData.getVehiculos() != null && !clienteData.getVehiculos().isEmpty()) {
            for (Vehiculos v : clienteData.getVehiculos()) {
                normalizarVehiculo(v);
                v.setCliente(clienteFinal); 
            }
            clienteFinal.setVehiculos(clienteData.getVehiculos());
        }

        // 3. Guardamos (Hibernate gestiona la relación y el ID automáticamente)
        return clienteRepository.save(clienteFinal);
    }

    /* ==============================================================
        3. GUARDAR CLIENTE SOLO (MÉTODO AUXILIAR)
       ============================================================== */
    public Cliente guardarCliente(Cliente clienteData) {
        normalizarCliente(clienteData);
        Optional<Cliente> existente = clienteRepository.findByIdentificacion(clienteData.getIdentificacion());
        
        if (existente.isPresent()) {
            Cliente clienteActualizar = existente.get();
            clienteActualizar.setNombreCompleto(clienteData.getNombreCompleto());
            clienteActualizar.setTelefono(clienteData.getTelefono());
            clienteActualizar.setCorreo(clienteData.getCorreo());
            return clienteRepository.save(clienteActualizar);
        } else {
            return clienteRepository.save(clienteData);
        }
    }

    /* ==============================================================
        4. ELIMINAR CLIENTE
       ============================================================== */
    public void eliminarCliente(Long id) {
        clienteRepository.deleteById(id);
    }

    /* ==============================================================
        5. BUSCAR POR ID
       ============================================================== */
    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    private void normalizarCliente(Cliente cliente) {
        if (cliente == null) return;
        cliente.setNombreCompleto(mayuscula(cliente.getNombreCompleto()));
        cliente.setTelefono(mayuscula(cliente.getTelefono()));
        cliente.setIdentificacion(mayuscula(cliente.getIdentificacion()));
        cliente.setCorreo(minuscula(cliente.getCorreo()));
    }

    private void normalizarVehiculo(Vehiculos vehiculo) {
        if (vehiculo == null) return;
        vehiculo.setPlaca(mayuscula(vehiculo.getPlaca()));
        vehiculo.setTipoVehiculo(mayuscula(vehiculo.getTipoVehiculo()));
        vehiculo.setMarca(mayuscula(vehiculo.getMarca()));
        vehiculo.setColor(mayuscula(vehiculo.getColor()));
        vehiculo.setModelo(mayuscula(vehiculo.getModelo()));
    }

    private String mayuscula(String valor) {
        return valor == null ? null : valor.trim().toUpperCase();
    }

    private String minuscula(String valor) {
        return valor == null ? null : valor.trim().toLowerCase();
    }
}
