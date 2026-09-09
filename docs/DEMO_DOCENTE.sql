-- DEMO PARQUEADERO LOT
-- Archivo para mostrar en MySQL Workbench durante la sustentacion.
-- Base de datos: parqueaderolot

USE parqueaderolot;

-- 1. Confirmar que la aplicacion tiene tablas reales en MySQL.
SHOW TABLES;

-- 2. Usuarios y roles del sistema.
SELECT
  id,
  correo,
  `nombres del usuario` AS nombre,
  `apellido del usuario` AS apellido,
  rol,
  fecha_registro
FROM usuarios;

-- 3. Tarifas usadas por el POS para calcular el valor a pagar.
SELECT
  tipo_vehiculo,
  valor_minuto,
  activa,
  fecha_actualizacion
FROM tarifas
ORDER BY tipo_vehiculo;

-- 4. Clientes registrados y sus vehiculos.
SELECT
  c.identificacion,
  c.nombre_completo,
  c.telefono,
  c.correo,
  v.placa,
  v.tipo_vehiculo,
  v.marca,
  v.color,
  v.modelo
FROM clientes c
LEFT JOIN vehiculos v ON v.cliente_id = c.id
ORDER BY c.id DESC, v.placa;

-- 5. Registros de entrada y salida.
-- Aqui se ve si el vehiculo esta ACTIVO o si ya tuvo SALIDA.
SELECT
  id,
  placa,
  tipo_vehiculo,
  marca,
  color,
  lugar_asignado,
  estado,
  fecha_entrada,
  fecha_salida,
  tiempo_total_minutos,
  tarifa_aplicada,
  valor_total,
  metodo_pago,
  transaccion_id
FROM registros
ORDER BY id DESC
LIMIT 15;

-- 6. Calculo en vivo del valor a pagar para vehiculos activos.
-- Esta consulta demuestra que el sistema calcula minutos x tarifa.
SELECT
  r.id,
  r.placa,
  r.tipo_vehiculo,
  r.lugar_asignado,
  r.estado,
  r.fecha_entrada,
  TIMESTAMPDIFF(MINUTE, r.fecha_entrada, NOW()) AS minutos_en_parqueadero,
  t.valor_minuto,
  TIMESTAMPDIFF(MINUTE, r.fecha_entrada, NOW()) * t.valor_minuto AS valor_estimado
FROM registros r
LEFT JOIN tarifas t
  ON t.tipo_vehiculo = CASE
    WHEN UPPER(r.tipo_vehiculo) IN ('AUTOMOVIL', 'AUTOMÓVIL') THEN 'AUTOMOVIL'
    WHEN UPPER(r.tipo_vehiculo) = 'MOTOCICLETA' THEN 'MOTOCICLETA'
    WHEN UPPER(r.tipo_vehiculo) IN ('PESADO', 'CARGA PESADA') THEN 'PESADO'
    ELSE UPPER(r.tipo_vehiculo)
  END
WHERE r.estado = 'ACTIVO'
ORDER BY r.fecha_entrada DESC;

-- 7. Reservas realizadas desde el portal cliente.
SELECT
  codigo_reserva,
  estado,
  cliente_cedula,
  cliente_nombre,
  cliente_telefono,
  cliente_correo,
  placa,
  tipo_vehiculo,
  lugar_asignado,
  fecha_reserva,
  vence_en,
  fecha_confirmacion,
  prorrogas_usadas,
  valor_prorroga
FROM reservas
ORDER BY id DESC
LIMIT 15;

-- 8. Ingresos cerrados por metodo de pago.
SELECT
  COALESCE(metodo_pago, 'SIN METODO') AS metodo_pago,
  COUNT(*) AS cantidad_servicios,
  SUM(COALESCE(valor_total, 0)) AS total_recaudado
FROM registros
WHERE estado = 'FINALIZADO'
GROUP BY COALESCE(metodo_pago, 'SIN METODO')
ORDER BY total_recaudado DESC;

-- 9. Total recaudado por tipo de vehiculo.
SELECT
  tipo_vehiculo,
  COUNT(*) AS servicios_finalizados,
  SUM(COALESCE(valor_total, 0)) AS total_recaudado
FROM registros
WHERE estado = 'FINALIZADO'
GROUP BY tipo_vehiculo
ORDER BY total_recaudado DESC;

-- 10. Auditoria del panel administrador.
-- Muestra cambios como actualizacion de tarifas o usuarios.
SELECT
  fecha,
  usuario,
  rol,
  entidad,
  accion,
  motivo,
  detalle
FROM auditoria_cambios
ORDER BY fecha DESC
LIMIT 20;

-- 11. Cierre de caja.
SELECT
  fecha_cierre,
  responsable_correo,
  responsable_rol,
  base_inicial,
  efectivo_declarado,
  gastos,
  efectivo_sistema,
  total_ingresos,
  diferencia,
  estado
FROM cierres_caja
ORDER BY id DESC
LIMIT 10;
