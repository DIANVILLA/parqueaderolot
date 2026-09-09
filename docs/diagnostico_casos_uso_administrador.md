# Diagnostico de casos de uso - Administrador Parqueadero LOT

Fecha de revision: 2026-06-25

## Contexto revisado

- Documento recibido: `casos de uso de administrador.docx`.
- Frontend revisado: `DIANVILLA/parquqdero-lot-react`.
- Backend revisado: `DIANVILLA/parqueaderolot`.
- Roles que deben existir: `CLIENTE`, `ADMINISTRADOR`, `OPERARIO`, `CONTADOR`, `CAJERO`.

## Hallazgo general

El documento de Didier contiene 8 pilares correctos para el administrador, pero no estan escritos todavia como casos de uso completos. Hoy son una lista de capacidades esperadas. Para entregarlo como evidencia academica o tecnica, conviene convertir cada punto en caso de uso con actor, objetivo, precondiciones, flujo principal, excepciones, datos afectados y roles autorizados.

## Estado observado en el codigo

### Frontend

- Existe login y menu principal.
- Existe mapa de ocupacion con espacios por tipo de vehiculo.
- Existe registro de entrada.
- Existe registro de salida y POS con efectivo, Nequi, DaviPlata, QR, datáfono y pago mixto.
- Existe pantalla de reporte diario/cierre de turno, pero usa datos simulados.
- Existe un archivo de gestion de usuarios, pero no esta integrado en las rutas principales y tiene referencias de importacion inconsistentes.
- El control de acceso por administrador esta incompleto: `App.js` intenta guardar `usuarioLogueado`, pero `login.jsx` no devuelve el usuario ni el rol al estado global.
- El `package.json` del frontend no parece corresponder a una app React completa; parece el manifiesto de `primeicons`. Faltan dependencias reales como `react`, `react-dom`, `react-router-dom`, `primereact`, `axios`, etc.

### Backend

- Existe modelo `Usuarios` con campo `rol`.
- Existe login por correo/password.
- Existe CRUD basico de usuarios, clientes, vehiculos y registros.
- Existe registro de entrada y salida.
- Existe calculo de cobro, pero usa una tarifa generica `parqueadero.tarifa.minuto:50.0`.
- En `application.properties` hay tarifas por tipo de vehiculo, pero el servicio no las usa realmente.
- No existe seguridad formal por roles en backend.
- No existe cierre de caja persistido.
- No existe arqueo de caja persistido.
- No existe auditoria inmutable de cambios.
- No existe historico mensual/anual ni exportacion Excel.
- No existe endpoint de BI.
- No existe deteccion automatica de registros huerfanos mayores a 24 horas.
- No existe conciliacion formal entre valor calculado, monto recibido y diferencia.

## Casos de uso recomendados para el Administrador

| ID | Caso de uso | Actor principal | Roles relacionados | Estado |
| --- | --- | --- | --- | --- |
| CU-ADM-01 | Iniciar sesion con rol y permisos | Administrador | Administrador, Operario, Contador, Cajero, Cliente | Parcial |
| CU-ADM-02 | Gestionar usuarios y roles | Administrador | Todos | Parcial |
| CU-ADM-03 | Activar, editar o desactivar usuarios | Administrador | Todos | Parcial |
| CU-ADM-04 | Configurar tarifas por tipo de vehiculo | Administrador | Cajero, Operario | Parcial |
| CU-ADM-05 | Consultar ocupacion en tiempo real | Administrador | Operario, Cajero | Parcial |
| CU-ADM-06 | Detectar registros huerfanos mayores a 24 horas | Administrador | Operario | Faltante |
| CU-ADM-07 | Revisar salidas manuales o contingencias | Administrador | Cajero | Parcial frontend |
| CU-ADM-08 | Realizar cierre de caja / arqueo ciego | Administrador | Cajero, Contador | Parcial frontend |
| CU-ADM-09 | Conciliar pagos contra valor calculado | Administrador | Cajero, Contador | Faltante |
| CU-ADM-10 | Aprobar y congelar turno | Administrador | Cajero, Contador | Parcial frontend |
| CU-ADM-11 | Consultar reportes diarios | Administrador | Contador | Parcial frontend |
| CU-ADM-12 | Consultar historico por ano y mes | Administrador | Contador | Faltante |
| CU-ADM-13 | Exportar reportes a Excel | Administrador | Contador | Faltante |
| CU-ADM-14 | Consultar BI: horas pico, rentabilidad y medios de pago | Administrador | Contador | Faltante |
| CU-ADM-15 | Consultar bitacora/auditoria de cambios | Administrador | Todos | Faltante |

## Casos de uso que faltan frente al documento recibido

1. Gestion de roles completa.
   - El sistema debe reconocer y aplicar los roles `CLIENTE`, `ADMINISTRADOR`, `OPERARIO`, `CONTADOR`, `CAJERO`.
   - El backend debe devolver el usuario autenticado con su rol.
   - El frontend debe ocultar o bloquear pantallas segun rol.

2. Administracion real de usuarios.
   - Crear usuario.
   - Editar usuario.
   - Cambiar rol.
   - Desactivar usuario sin borrar historial.
   - Resetear password.

3. Parametrizacion de tarifas.
   - Crear tarifas por tipo de vehiculo.
   - Definir vigencia.
   - Evitar cambios sin registro de auditoria.
   - Usar esas tarifas en el calculo real de salida.

4. Cierre de caja persistido.
   - Guardar base inicial.
   - Guardar efectivo declarado.
   - Guardar gastos/vales y motivo.
   - Guardar ingresos por metodo de pago.
   - Calcular diferencia.
   - Congelar turno.

5. Conciliacion de pagos.
   - Guardar `valor_calculado`.
   - Guardar `monto_recibido`.
   - Guardar `metodo_pago`.
   - Guardar diferencia, sobrante o faltante.
   - Marcar salidas manuales como contingencia.

6. Auditoria inmutable.
   - Quién hizo el cambio.
   - Cuándo lo hizo.
   - Qué cambió.
   - Motivo.
   - Valor anterior y valor nuevo.

7. Registros huerfanos.
   - Detectar registros activos con mas de 24 horas.
   - Mostrar alerta al administrador.
   - Permitir correccion con motivo obligatorio.

8. Historico y Excel.
   - Selector de ano y mes.
   - Reporte por dia, mes y rango de fechas.
   - Exportacion Excel para contador.

9. BI administrativo.
   - Horas pico.
   - Rentabilidad por tipo de vehiculo.
   - Metodos de pago mas usados.
   - Ocupacion promedio.
   - Salidas manuales por cajero.

## Propuesta de backend para el modulo administrador

Crear o completar estos modulos:

- `AuthController`: login que devuelva usuario, rol y permisos.
- `UsuarioController`: CRUD completo de usuarios con desactivacion.
- `TarifaController`: CRUD de tarifas por tipo de vehiculo.
- `CierreCajaController`: declarar, revisar, aprobar y congelar turno.
- `ReporteController`: reportes diario, mensual, historico y BI.
- `AuditoriaController`: consulta de logs inmutables.
- `AlertaController`: registros huerfanos y salidas manuales.

Entidades sugeridas:

- `Rol` o enum de roles.
- `Tarifa`.
- `CierreCaja`.
- `DetallePago`.
- `AuditoriaCambio`.
- `Turno`.

## Propuesta de frontend para el modulo administrador

Crear una seccion `Administrador` con estas pantallas:

- Dashboard administrativo.
- Gestion de usuarios y roles.
- Tarifas.
- Cierre de caja.
- Conciliacion de pagos.
- Alertas: registros huerfanos y salidas manuales.
- Reportes e historico.
- BI.
- Auditoria.

## Prioridad recomendada

1. Corregir login para devolver usuario y rol.
2. Corregir `package.json` del frontend para que el proyecto pueda instalarse y ejecutarse.
3. Integrar pantalla real de gestion de usuarios al menu.
4. Implementar control de acceso por roles en frontend y backend.
5. Implementar cierre de caja persistido.
6. Implementar reportes historicos y exportacion Excel.
7. Implementar auditoria y alertas.
8. Implementar BI.

## Conclusion

La base del sistema permite continuar la construccion del modulo administrador tanto en frontend como en backend. El proyecto ya cuenta con pantallas y servicios iniciales, pero para una entrega completa se recomienda fortalecer persistencia, control real por roles, auditoria, cierres, historicos y reportes administrativos.
