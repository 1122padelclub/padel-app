-- Script para crear el primer super admin
-- Ejecutar después de crear un usuario manualmente en Firebase Auth

-- Insertar el primer super admin en Firestore
-- Reemplazar 'SUPER_ADMIN_UID' con el UID real del usuario creado en Firebase Auth
INSERT INTO users (uid, email, role, created_at) VALUES
('SUPER_ADMIN_UID', 'superadmin@matchtag.com', 'super_admin', NOW());

-- Ejemplo de datos de prueba para desarrollo
-- Crear un bar de ejemplo
INSERT INTO bars (id, name, address, admin_ids, is_active, created_at) VALUES
('example-bar-id', 'Bar Ejemplo', 'Calle Falsa 123, Ciudad', '[]', true, NOW());

-- Crear un admin de ejemplo
INSERT INTO users (uid, email, role, bar_id, created_at) VALUES
('example-admin-uid', 'admin@barexample.com', 'bar_admin', 'example-bar-id', NOW());

-- Crear mesas de ejemplo
INSERT INTO tables (id, bar_id, number, is_active, created_at) VALUES
('table-1', 'example-bar-id', 1, true, NOW()),
('table-2', 'example-bar-id', 2, true, NOW()),
('table-3', 'example-bar-id', 3, true, NOW());
