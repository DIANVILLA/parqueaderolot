# Casos de uso del Administrador implementados en codigo

Fecha: 2026-06-25

## Roles oficiales

El modulo reconoce como roles base:

- `CLIENTE`
- `ADMINISTRADOR`
- `OPERARIO`
- `CONTADOR`
- `CAJERO`

## Mapa de trazabilidad

| Caso de uso | Nombre | Backend | Frontend |
| --- | --- | --- | --- |
| CU-ADM-01 | Iniciar sesion con rol y permisos | `UsuariosController.login`, `AdminController.roles` | `login.jsx`, `MenuPrincipal.jsx`, `AdminPanel.jsx` |
| CU-ADM-02 | Gestionar usuarios y roles | `AdminController.usuarios`, `AdminService.guardarUsuario` | `AdminPanel.jsx` |
| CU-ADM-03 | Crear/editar usuarios | `AdminController.guardarUsuario` | `AdminPanel.jsx` |
| CU-ADM-04 | Configurar tarifas | `Tarifa`, `TarifaRepository`, `AdminController.tarifas`, `RegistrosService.calcularCobro` | `AdminPanel.jsx` |
| CU-ADM-05 | Consultar ocupacion/resumen | `AdminService.dashboard` | `AdminPanel.jsx` |
| CU-ADM-06 | Detectar registros huerfanos | `RegistrosRepository.findByEstadoAndFechaEntradaBefore`, `AdminController.registrosHuerfanos` | `AdminPanel.jsx` |
| CU-ADM-07 | Revisar contingencias/salidas manuales | Base preparada en alertas administrativas | `RegistrarSalida.jsx`, `AdminPanel.jsx` |
| CU-ADM-08 | Cierre de caja | `CierreCaja`, `CierreCajaRepository`, `AdminController.cerrarCaja` | `AdminPanel.jsx` |
| CU-ADM-09 | Conciliar pagos | `AdminService.cerrarCaja`, `RegistrosService.procesarSalida` | `AdminPanel.jsx`, `RegistrarSalida.jsx` |
| CU-ADM-10 | Aprobar y congelar turno | `AdminService.cerrarCaja` | `AdminPanel.jsx` |
| CU-ADM-11 | Reportes diarios/historicos | `AdminController.historico` | `AdminPanel.jsx` |
| CU-ADM-12 | Navegar historico por ano/mes | `AdminService.historico` | `AdminPanel.jsx` |
| CU-ADM-13 | Exportar Excel/CSV | Endpoint historico listo para exportacion | `AdminPanel.exportarHistoricoCsv` |
| CU-ADM-14 | Inteligencia de negocios | `AdminController.bi`, `RegistrosRepository.resumenPorMetodoPago`, `rentabilidadPorTipo`, `horasPico` | `AdminPanel.jsx` |
| CU-ADM-15 | Auditoria inmutable | `AuditoriaCambio`, `AuditoriaCambioRepository`, `AdminService.auditar` | `AdminPanel.jsx` |

## Archivos agregados al backend

- `backend/src/main/java/com/edu/sena/parqueadero_lot/Model/Tarifa.java`
- `backend/src/main/java/com/edu/sena/parqueadero_lot/Model/CierreCaja.java`
- `backend/src/main/java/com/edu/sena/parqueadero_lot/Model/AuditoriaCambio.java`
- `backend/src/main/java/com/edu/sena/parqueadero_lot/Repository/TarifaRepository.java`
- `backend/src/main/java/com/edu/sena/parqueadero_lot/Repository/CierreCajaRepository.java`
- `backend/src/main/java/com/edu/sena/parqueadero_lot/Repository/AuditoriaCambioRepository.java`
- `backend/src/main/java/com/edu/sena/parqueadero_lot/Service/AdminService.java`
- `backend/src/main/java/com/edu/sena/parqueadero_lot/controller/AdminController.java`

## Archivos modificados del backend

- `backend/src/main/java/com/edu/sena/parqueadero_lot/controller/UsuariosController.java`
- `backend/src/main/java/com/edu/sena/parqueadero_lot/Service/RegistrosService.java`
- `backend/src/main/java/com/edu/sena/parqueadero_lot/Repository/RegistrosRepository.java`
- `backend/pom.xml`

## Archivos agregados al frontend

- `frontend-react/src/Component/AdminPanel.jsx`
- `frontend-react/src/Component/AdminPanel.css`

## Archivos modificados del frontend

- `frontend-react/package.json`
- `frontend-react/src/App.js`
- `frontend-react/src/ParqueaderolotService.js`
- `frontend-react/src/Component/login.jsx`
- `frontend-react/src/Component/MenuPrincipal.jsx`

## Validacion realizada

- Backend: compilacion Maven exitosa con `-DskipTests package`.
- Frontend: `npm install` ejecutado y `npm run build` exitoso.

## Pendientes recomendados

- Agregar seguridad real con Spring Security o filtros por rol.
- Guardar salidas manuales con campo explicito de contingencia.
- Reemplazar passwords en texto plano por hash.
- Crear pruebas automatizadas para endpoints administrativos.
- Crear exportacion Excel real `.xlsx` en backend si el instructor la exige como archivo Excel nativo.
