# API — Parqueadero LOT

Backend Spring Boot, base URL local: `http://localhost:8090`. Todas las rutas listadas abajo van precedidas por esa base. Formato de intercambio: JSON.

## Usuarios — `/api/usuarios`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Lista todos los usuarios. |
| POST | `/api/usuarios` | Crea un usuario (la contraseña se guarda con hash BCrypt). |
| PUT | `/api/usuarios/{id}` | Actualiza nombre y correo de un usuario. |
| DELETE | `/api/usuarios/{id}` | Elimina un usuario. |
| POST | `/api/usuarios/login` | Inicia sesión. Body: `{ "username": "correo", "password": "clave" }`. |

## Clientes — `/api/clientes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes` | Lista todos los clientes. |
| GET | `/api/clientes/{id}` | Busca un cliente por id. |
| GET | `/api/clientes/buscar/{identificacion}` | Busca cliente por cédula/NIT (usado para autocompletar en el frontend). |
| POST | `/api/clientes` | Registra un cliente y su vehículo en cascada. |
| DELETE | `/api/clientes/{id}` | Elimina un cliente. |

## Vehículos — `/api/vehiculos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/vehiculos` | Lista todos los vehículos. |
| GET | `/api/vehiculos/buscar/{placa}` | Busca vehículo (y su propietario) por placa. |
| POST | `/api/vehiculos/guardar` | Registra un vehículo. |
| PUT | `/api/vehiculos/{id}` | Actualiza un vehículo. |
| DELETE | `/api/vehiculos/{id}` | Elimina un vehículo. |

## Registros (entrada/salida) — `/api/registros`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/registros/listar` | Lista todos los registros de ingreso/salida. |
| GET | `/api/registros/activos` | Lista solo los vehículos actualmente dentro del parqueadero. |
| POST | `/api/registros` | Registra el ingreso de un vehículo. |
| PUT | `/api/registros/salida/placa/{placa}` | Registra la salida y el pago de un vehículo activo por placa. Query params: `metodoPago`, `transaccionId` (opcional). |
| PUT | `/api/registros/{id}` | Edita los datos de un registro existente. |
| DELETE | `/api/registros/{id}` | Elimina un registro. |

## Reservas — `/api/reservas`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/reservas` | Lista todas las reservas. |
| GET | `/api/reservas/activas` | Lista reservas activas. |
| GET | `/api/reservas/cliente/{cedula}` | Lista reservas de un cliente. |
| GET | `/api/reservas/codigo/{codigo}` | Busca una reserva por su código. |
| GET | `/api/reservas/placa/{placa}/activa` | Busca la reserva activa de una placa. |
| POST | `/api/reservas` | Crea una reserva de cupo. |
| PUT | `/api/reservas/{id}/prorrogar` | Extiende el tiempo de una reserva. Query params: `metodoPago`, `referencia` (opcionales). |
| PUT | `/api/reservas/{id}/confirmar-ingreso` | Convierte una reserva en un registro de ingreso real. |
| PUT | `/api/reservas/{id}/cancelar` | Cancela una reserva. |

## Administración — `/api/admin`

Cada caso de uso referenciado (`CU-ADM-XX`) está descrito con más detalle en [`casos_uso_administrador_codigo.md`](casos_uso_administrador_codigo.md).

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/dashboard` | Panel inicial del administrador. |
| GET | `/api/admin/roles` | Roles oficiales del sistema. |
| GET | `/api/admin/usuarios` | Lista usuarios (vista administrador). |
| POST | `/api/admin/usuarios` | Crea/edita un usuario dejando rastro de auditoría. Query params: `responsable`, `motivo` (opcionales). |
| GET | `/api/admin/tarifas` | Lista tarifas por tipo de vehículo. |
| POST | `/api/admin/tarifas` | Crea/actualiza una tarifa dejando rastro de auditoría. Query params: `responsable`, `motivo` (opcionales). |
| GET | `/api/admin/alertas/registros-huerfanos` | Vehículos activos por más de 24 horas sin salida registrada. |
| POST | `/api/admin/cierres-caja` | Cierra, concilia y congela el turno de caja. |
| GET | `/api/admin/reportes/historico` | Histórico de operaciones por año/mes. Query params: `anio`, `mes` (opcionales, por defecto el mes actual). |
| GET | `/api/admin/reportes/bi` | Reporte de inteligencia de negocio. Query params: `anio`, `mes` (opcionales). |
| GET | `/api/admin/auditoria` | Bitácora de auditoría (inmutable). |

## Notas

- Todos los controladores tienen `@CrossOrigin` abierto (`origins = "*"`) — pensado para desarrollo local, no para producción.
- El campo `password` del modelo `Usuarios` nunca se devuelve en las respuestas (`@JsonIgnore`).
- No hay autenticación por token/sesión entre peticiones todavía: el login valida credenciales pero no emite un JWT ni una cookie de sesión — cada pantalla del frontend confía en lo que guardó localmente tras el login.
