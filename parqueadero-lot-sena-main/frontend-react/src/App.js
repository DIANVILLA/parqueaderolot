import React, { useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// IMPORTACIONES ESTRICTAMENTE NECESARIAS
import Login from './Component/login'; 
import MenuPrincipal from './Component/MenuPrincipal'; 
import PortalCliente from './Component/PortalCliente';
import LandingPage from './Component/LandingPage';

function App() {
  // ESTADO GLOBAL: La lista de vehículos activos en el patio
  const [vehiculos, setVehiculos] = useState([]); 

  // CIMIENTO DE ROLES: Estado global del usuario logueado
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); 

  return (
    <Router>
      <Routes>
        {/* 1. Página pública inicial */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Login */}
        <Route path="/login" element={
          <Login setUsuarioLogueado={setUsuarioLogueado} />
        } />

        {/* Portal publico para clientes: registro, reserva, prorroga y ticket QR */}
        <Route path="/cliente" element={<PortalCliente />} />

        {/* 3. Panel Principal (¡CORREGIDO!) */}
        <Route path="/menu" element={
          <MenuPrincipal pantalla="inicio" vehiculos={vehiculos} setVehiculos={setVehiculos} usuario={usuarioLogueado} />
        } />

        {/* 4. Entrada */}
        <Route path="/entrada" element={
          <MenuPrincipal pantalla="entrada" vehiculos={vehiculos} setVehiculos={setVehiculos} usuario={usuarioLogueado} />
        } />
        
        {/* 5. Salida */}
        <Route path="/salida" element={
          <MenuPrincipal pantalla="salida" vehiculos={vehiculos} setVehiculos={setVehiculos} usuario={usuarioLogueado} />
        } />

        {/* 6. Nuevo Cliente */}
        <Route path="/nuevo-cliente" element={
          <MenuPrincipal pantalla="registro" vehiculos={vehiculos} setVehiculos={setVehiculos} usuario={usuarioLogueado} />
        } />

        {/* 7. Ocupación  */}
        <Route path="/ocupacion" element={
          <MenuPrincipal pantalla="ocupacion" vehiculos={vehiculos} setVehiculos={setVehiculos} usuario={usuarioLogueado} />
        } />

        {/* 8. Reporte Diario */}
        <Route path="/reporte-diario" element={
          <MenuPrincipal pantalla="reporte" usuario={usuarioLogueado} />
        } />

        {/* CU-ADM-01 a CU-ADM-15: Modulo integral del Administrador */}
        <Route path="/admin" element={
          <MenuPrincipal pantalla="admin" vehiculos={vehiculos} setVehiculos={setVehiculos} usuario={usuarioLogueado} />
        } />

      </Routes>
    </Router>
  );
}

export default App;
