# Guia de entrega - Parqueadero LOT

## Descripcion general

Sistema web para la gestion operativa de un parqueadero. Incluye pagina publica, login por usuario, portal de reservas para clientes, registro de entrada, salida/POS, mapa de ocupacion, panel administrador, tarifas, auditoria, reportes y cierre de caja.

## Roles considerados

- CLIENTE
- ADMINISTRADOR
- OPERARIO
- CONTADOR
- CAJERO

## Rutas principales

- `/`: pagina publica del parqueadero.
- `/login`: ingreso de usuarios internos.
- `/cliente`: portal de reserva de cupo para clientes.
- `/menu`: panel principal.
- `/entrada`: registro de ingreso de vehiculos.
- `/salida`: liquidacion y salida/POS.
- `/ocupacion`: estado de ocupacion.
- `/reporte-diario`: cierre de turno y reportes.
- `/admin`: panel administrativo.

## Ejecucion local

### Forma rapida con los archivos `.bat`

En Windows se puede ejecutar en este orden:

```text
02_crear_base_datos.bat
01_instalar_dependencias.bat
03_iniciar_aplicacion.bat
```

El archivo de base de datos pide el usuario y la clave de MySQL. No borra la informacion existente; crea la base, crea las tablas si hacen falta y registra los datos iniciales de prueba.

### Backend

```bash
cd backend
mvn spring-boot:run
```

El backend se ejecuta en:

```text
http://localhost:8090
```

### Frontend

```bash
cd frontend-react
npm install
npm start
```

El frontend se ejecuta en:

```text
http://localhost:3000
```

## Base de datos

Motor: MySQL

Base esperada:

```text
parqueaderolot
```

Credenciales locales usadas en desarrollo:

```text
usuario: root
password: 1234
```

Tambien se incluye el script:

```text
database/parqueaderolot_schema.sql
```

Este archivo deja listas las tablas principales, el usuario de prueba y las tarifas iniciales.

## Usuario de prueba

```text
usuario: ricardoriascos07@gmail.com
password: 1234
```

## Archivos o carpetas que no se deben subir como entrega

- `frontend-react/node_modules`
- `frontend-react/build`
- `backend/target`
- `.git`
- `.agents`
- `_docx_extract`
- archivos `.zip` temporales
- capturas de pantalla temporales
- archivos `.env` o `.env.local`

## Nota sobre archivos heredados

El archivo `frontend-react/src/RegistrarEntrada.jsx` pertenece a una version anterior y no es la pantalla integrada en las rutas actuales. La pantalla usada por la aplicacion esta en `frontend-react/src/Component/RegistrarEntrada.jsx`.

## Documentos de soporte

- `casos de uso de administrador.docx`
- `casos_uso_administrador_codigo.md`
- `diagnostico_casos_uso_administrador.md`

## Validaciones realizadas

- Compilacion frontend con `npm run build`.
- Compilacion backend con Maven usando `-DskipTests package`.
- Verificacion de puerto backend `8090`.
- Verificacion de conexion frontend a backend por `/api`.

## Recomendaciones para sustentacion

- Explicar el flujo de reserva: pagina publica -> portal cliente -> reserva -> confirmacion de ingreso.
- Explicar el flujo operativo: entrada -> ocupacion -> salida/POS -> comprobante.
- Explicar el panel administrador por casos de uso: usuarios, tarifas, caja, reportes, BI y auditoria.
- Aclarar que las credenciales y configuracion de MySQL son de entorno local academico.
