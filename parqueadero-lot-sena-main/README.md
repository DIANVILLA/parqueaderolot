# Parqueadero LOT

Sistema web de gestión operativa para un parqueadero: control de cupos, registro de entrada/salida con cobro (POS), portal de reservas para clientes, mapa de ocupación en tiempo real, panel administrativo con tarifas y auditoría, y cierre de caja.

Proyecto de portafolio desarrollado en el marco de prácticas de Análisis y Desarrollo de Software (SENA).

## Qué problema resuelve

- Reemplaza el control manual de entradas/salidas por un registro digital con fecha y hora exactas.
- Calcula automáticamente el cobro según el tiempo real de parqueo y la tarifa por tipo de vehículo.
- Permite a los clientes reservar un cupo desde un portal propio.
- Muestra la ocupación del parqueadero en vivo.
- Deja auditoría de cualquier cambio administrativo (por ejemplo, cambios de tarifa).
- Organiza distintos roles (Cliente, Administrador, Operario, Contador, Cajero) con sus propias vistas.

## Roles

CLIENTE · ADMINISTRADOR · OPERARIO · CONTADOR · CAJERO

## Tecnologías

- **Backend:** Java 21 + Spring Boot 3.2.5 (Spring Web, Spring Data JPA, Spring Mail, BCrypt vía `spring-security-crypto`, Lombok)
- **Frontend:** React 18, React Router, PrimeReact, Chart.js, Axios
- **Base de datos:** MySQL 8.0
- **Build:** Maven (backend, con wrapper `mvnw`), npm (frontend)

## Estructura del proyecto

```
parqueadero-lot-sena-main/
├── README.md
├── backend/              Spring Boot (puerto 8090)
├── frontend-react/       React (puerto 3000)
├── database/
│   └── parqueaderolot_schema.sql
├── docs/                 Documentación del proyecto
│   ├── api.md
│   ├── ENTREGA_SENA.md
│   ├── GUIA_DEMO_DOCENTE.md
│   ├── casos_uso_administrador_codigo.md
│   └── diagnostico_casos_uso_administrador.md
├── 01_instalar_dependencias.bat
├── 02_crear_base_datos.bat
└── 03_iniciar_aplicacion.bat
```

## Cómo ejecutarlo

Requiere Node.js, Java 21 y MySQL Server instalados localmente.

### Forma rápida (Windows)

En este orden:

```text
02_crear_base_datos.bat
01_instalar_dependencias.bat
03_iniciar_aplicacion.bat
```

### Manual

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Corre en `http://localhost:8090`.

Frontend:

```bash
cd frontend-react
npm install
npm start
```

Corre en `http://localhost:3000`.

### Base de datos

Motor MySQL, base esperada: `parqueaderolot`. El script `database/parqueaderolot_schema.sql` crea las tablas y datos de prueba iniciales.

Credenciales de conexión usadas en desarrollo local (`backend/src/main/resources/application.properties`):

```text
usuario: root
password: 1234
```

### Usuario de prueba

```text
usuario: ricardoriascos07@gmail.com
password: 1234
```

## Documentación

- [Documentación de la API (endpoints)](docs/api.md)
- [Guía de entrega](docs/ENTREGA_SENA.md)
- [Guía de demo para docente](docs/GUIA_DEMO_DOCENTE.md)
- [Casos de uso del administrador](docs/casos_uso_administrador_codigo.md)

## Seguridad

- Las contraseñas de usuario se guardan con hash BCrypt (nunca en texto plano) y nunca se devuelven en las respuestas de la API.
- Las credenciales de MySQL y de correo en `application.properties` son de entorno local académico, no de producción.

## Notas

- `frontend-react/src/RegistrarEntrada.jsx` pertenece a una versión anterior; la pantalla vigente es `frontend-react/src/Component/RegistrarEntrada.jsx`.
- No incluir en la entrega: `frontend-react/node_modules`, `frontend-react/build`, `backend/target`, `.git`, archivos `.env`.
