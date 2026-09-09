# Guia rapida para presentar Parqueadero LOT

## 1. Abrir lo necesario

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8090`
- MySQL Workbench: abrir la conexion local de MySQL.
- Archivo SQL de apoyo: `DEMO_DOCENTE.sql`

## 2. Mostrar que la aplicacion esta conectada a MySQL

En MySQL Workbench abrir `DEMO_DOCENTE.sql` y ejecutar:

- `SHOW TABLES;`
- Consulta de `usuarios`
- Consulta de `tarifas`

Con eso se ve que la aplicacion no esta trabajando con datos sueltos, sino con tablas reales.

## 3. Mostrar registro de entrada

En la aplicacion:

1. Entrar al sistema con el usuario de prueba.
2. Ir a `Registrar Entrada`.
3. Registrar una placa nueva o usar un cliente ya existente.
4. Guardar el ingreso.

En MySQL:

Ejecutar la consulta de `registros`. Debe aparecer el nuevo vehiculo con estado `ACTIVO`, fecha de entrada y cupo asignado.

## 4. Mostrar calculo del valor a pagar

En MySQL ejecutar la consulta:

```sql
-- 6. Calculo en vivo del valor a pagar para vehiculos activos.
```

Esa consulta muestra:

- Placa.
- Tipo de vehiculo.
- Tiempo en minutos.
- Tarifa por minuto.
- Valor estimado.

La idea para explicarlo:

> El sistema toma la fecha de entrada, calcula los minutos transcurridos y multiplica por la tarifa registrada para ese tipo de vehiculo.

## 5. Mostrar salida y pago

En la aplicacion:

1. Ir a `Registrar Salida`.
2. Buscar la placa activa.
3. Ver el valor calculado.
4. Registrar el pago.
5. Finalizar salida.

En MySQL:

Volver a ejecutar la consulta de `registros`. El mismo registro debe quedar con:

- `estado = FINALIZADO`
- `fecha_salida`
- `tiempo_total_minutos`
- `tarifa_aplicada`
- `valor_total`
- `metodo_pago`
- `transaccion_id`

## 6. Mostrar portal cliente y reservas

En la pagina principal:

1. Presionar `Reservar cupo`.
2. Consultar cliente por cedula o NIT.
3. Reservar un cupo.

En MySQL:

Ejecutar la consulta de `reservas`. Alli se ve el codigo de reserva, cliente, placa, cupo, vencimiento y estado.

## 7. Mostrar administrador

En la aplicacion:

1. Ir al panel administrador.
2. Cambiar una tarifa.

En MySQL:

Ejecutar consultas de:

- `tarifas`
- `auditoria_cambios`

Esto demuestra que el panel modifica datos y deja rastro de auditoria.

## Frase corta para sustentar

> Parqueadero LOT conecta el frontend en React con un backend Spring Boot y una base MySQL. Cada ingreso, salida, reserva, tarifa y cierre de caja queda guardado en tablas. El sistema calcula el cobro usando tiempo real de parqueo por tarifa configurada, y los cambios administrativos quedan registrados para auditoria.
