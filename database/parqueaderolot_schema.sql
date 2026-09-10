CREATE DATABASE IF NOT EXISTS parqueaderolot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE parqueaderolot;

CREATE TABLE IF NOT EXISTS clientes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  identificacion VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  telefono VARCHAR(255),
  correo VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uk_clientes_identificacion (identificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT NOT NULL AUTO_INCREMENT,
  correo VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL, -- debe caber un hash BCrypt (60 caracteres), no solo la contrasena semilla en texto plano
  `nombres del usuario` VARCHAR(20) NOT NULL,
  `apellido del usuario` VARCHAR(20) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  fecha_registro DATETIME(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehiculos (
  id BIGINT NOT NULL AUTO_INCREMENT,
  placa VARCHAR(255) NOT NULL,
  tipo_vehiculo VARCHAR(255),
  marca VARCHAR(255),
  color VARCHAR(255),
  modelo VARCHAR(255),
  cliente_id BIGINT,
  PRIMARY KEY (id),
  UNIQUE KEY uk_vehiculos_placa (placa),
  KEY idx_vehiculos_cliente (cliente_id),
  CONSTRAINT fk_vehiculos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registros (
  id BIGINT NOT NULL AUTO_INCREMENT,
  placa VARCHAR(10) NOT NULL,
  tipo_vehiculo VARCHAR(20),
  marca VARCHAR(50),
  modelo VARCHAR(50),
  color VARCHAR(20),
  propietario_nombre VARCHAR(100),
  propietario_cedula VARCHAR(20),
  propietario_telefono VARCHAR(20),
  lugar_asignado VARCHAR(10),
  fecha_entrada DATETIME(6),
  fecha_salida DATETIME(6),
  estado VARCHAR(20),
  tiempo_total_minutos BIGINT,
  tarifa_aplicada DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  metodo_pago VARCHAR(50),
  transaccion_id VARCHAR(100),
  observaciones TEXT,
  PRIMARY KEY (id),
  KEY idx_registros_placa (placa),
  KEY idx_registros_estado (estado),
  KEY idx_registros_fecha_entrada (fecha_entrada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tarifas (
  id BIGINT NOT NULL AUTO_INCREMENT,
  tipo_vehiculo VARCHAR(30) NOT NULL,
  valor_minuto DECIMAL(10,2) NOT NULL,
  activa BIT(1) NOT NULL,
  fecha_actualizacion DATETIME(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_tarifas_tipo_vehiculo (tipo_vehiculo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservas (
  id BIGINT NOT NULL AUTO_INCREMENT,
  codigo_reserva VARCHAR(40) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  placa VARCHAR(10) NOT NULL,
  tipo_vehiculo VARCHAR(20) NOT NULL,
  marca VARCHAR(50),
  modelo VARCHAR(50),
  color VARCHAR(30),
  cliente_nombre VARCHAR(120) NOT NULL,
  cliente_cedula VARCHAR(30) NOT NULL,
  cliente_telefono VARCHAR(30),
  cliente_correo VARCHAR(120),
  lugar_asignado VARCHAR(10) NOT NULL,
  fecha_reserva DATETIME(6) NOT NULL,
  vence_en DATETIME(6) NOT NULL,
  fecha_confirmacion DATETIME(6),
  prorrogas_usadas INT,
  valor_prorroga DECIMAL(10,2),
  metodo_pago_prorroga VARCHAR(50),
  referencia_prorroga VARCHAR(120),
  registro_id BIGINT,
  PRIMARY KEY (id),
  UNIQUE KEY uk_reservas_codigo (codigo_reserva),
  KEY idx_reservas_cliente_cedula (cliente_cedula),
  KEY idx_reservas_estado (estado),
  KEY idx_reservas_placa (placa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cierres_caja (
  id BIGINT NOT NULL AUTO_INCREMENT,
  responsable_correo VARCHAR(80) NOT NULL,
  responsable_rol VARCHAR(30) NOT NULL,
  base_inicial DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  efectivo_declarado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  gastos DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  motivo_gastos VARCHAR(255),
  efectivo_sistema DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_ingresos DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  diferencia DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTO',
  fecha_cierre DATETIME(6),
  PRIMARY KEY (id),
  KEY idx_cierres_fecha (fecha_cierre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria_cambios (
  id BIGINT NOT NULL AUTO_INCREMENT,
  usuario VARCHAR(80) NOT NULL,
  rol VARCHAR(30) NOT NULL,
  entidad VARCHAR(80) NOT NULL,
  entidad_id VARCHAR(40),
  accion VARCHAR(80) NOT NULL,
  detalle TEXT,
  motivo VARCHAR(255) NOT NULL,
  fecha DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_auditoria_fecha (fecha),
  KEY idx_auditoria_entidad (entidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO usuarios (
  correo,
  password,
  `nombres del usuario`,
  `apellido del usuario`,
  rol,
  fecha_registro
) VALUES (
  'ricardoriascos07@gmail.com',
  '1234',
  'RICARDO',
  'RIASCOS',
  'ADMINISTRADOR',
  NOW(6)
) ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  `nombres del usuario` = VALUES(`nombres del usuario`),
  `apellido del usuario` = VALUES(`apellido del usuario`),
  rol = VALUES(rol);

INSERT INTO tarifas (tipo_vehiculo, valor_minuto, activa, fecha_actualizacion) VALUES
  ('AUTOMOVIL', 50.00, b'1', NOW(6)),
  ('MOTOCICLETA', 30.00, b'1', NOW(6)),
  ('PESADO', 70.00, b'1', NOW(6))
ON DUPLICATE KEY UPDATE
  valor_minuto = VALUES(valor_minuto),
  activa = VALUES(activa),
  fecha_actualizacion = NOW(6);
