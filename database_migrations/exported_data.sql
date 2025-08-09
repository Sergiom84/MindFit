-- Datos exportados desde base de datos local
-- Fecha de exportación: 2025-08-09T00:15:27.925Z

-- Deshabilitar triggers y constraints
SET session_replication_role = replica;

-- Datos para tabla: users
DELETE FROM users;
INSERT INTO users (id, nombre, apellido, email, password, avatar, iniciales, nivel, edad, sexo, peso, altura, imc, nivel_actividad, experiencia, años_entrenando, metodologia_preferida, frecuencia_semanal, grasa_corporal, masa_muscular, agua_corporal, metabolismo_basal, cintura, pecho, brazos, muslos, cuello, antebrazos, historial_medico, limitaciones, alergias, medicamentos, objetivo_principal, meta_peso, meta_grasa, enfoque, horario_preferido, comidas_diarias, suplementacion, alimentos_excluidos, created_at, updated_at) VALUES
    (1, 'Sergi', 'Hernández ', 'sergiohernandezlara07@gmail.com', '$2b$10$A/AMvp500fRz2oRA8C3eb.ci81mjfSh6ozDgtTsqppvGkUQDOphU6', NULL, 'SH', 'intermedio', 41, 'masculino', '76.00', '183.00', '22.7', 'moderado', '', 20, 'heavy_duty', 3, '22.19', '59.14', '57.76', 1704, '90.00', '98.00', '33.00', '50.00', '355.00', '26.00', '', '["[{\"titulo\":\"Rodilla\",\"zona\":\"derecha\",\"severidad\":\"leve\",\"fecha\":\"2025-08-08\",\"estado\":\"activo\",\"tratamiento\":\"Ninguno\",\"limitacion_actual\":\"Molestia ak correr\",\"notas\":\"Reposo\"},{\"titulo\":\"Codo\",\"zona\":\"izquierdo\",\"severidad\":\"leve\",\"fecha\":\"20225-08-08\",\"estado\":\"activo\",\"tratamiento\":\"Niguno\",\"limitacion_actual\":\"Ninguna\",\"notas\":\"Leve molestia\"}]"]', 'Polen', '', 'ganar_masa', '79.00', NULL, 'hipertrofia', 'tarde', 2, '', 'Pizza', '2025-08-07T13:12:55.713Z', '2025-08-08T18:03:26.544Z');

-- Actualizar secuencia para users
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));

-- Datos para tabla: injuries
DELETE FROM injuries;
INSERT INTO injuries (id, user_id, titulo, zona, severidad, fecha, estado, tratamiento, limitacion_actual, notas, created_at, updated_at, tipo, gravedad, fecha_inicio, fecha_fin) VALUES
    (1, 1, NULL, NULL, NULL, NULL, 'activo', NULL, NULL, NULL, '2025-08-08T18:40:11.630Z', '2025-08-08T18:40:11.630Z', NULL, NULL, NULL, NULL),
    (4, 1, '', NULL, NULL, '2025-08-07T22:00:00.000Z', 'activo', NULL, NULL, NULL, '2025-08-08T20:41:49.040Z', '2025-08-08T20:41:49.040Z', NULL, NULL, NULL, NULL);

-- Actualizar secuencia para injuries
SELECT setval('injuries_id_seq', (SELECT COALESCE(MAX(id), 1) FROM injuries));

-- Rehabilitar triggers y constraints
SET session_replication_role = DEFAULT;

