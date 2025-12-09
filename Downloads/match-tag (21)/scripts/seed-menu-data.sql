-- Script para crear datos de ejemplo del menú
-- Este script debe ejecutarse después de crear un bar

-- Insertar categorías de menú de ejemplo
INSERT INTO menu_categories (bar_id, name, order_index) VALUES
('bar_example_id', 'Bebidas', 1),
('bar_example_id', 'Comidas', 2),
('bar_example_id', 'Postres', 3);

-- Insertar items de menú de ejemplo
INSERT INTO menu_items (bar_id, category_id, name, description, price, is_available) VALUES
-- Bebidas
('bar_example_id', 'category_bebidas_id', 'Cerveza Artesanal', 'Cerveza rubia de la casa', 8.50, true),
('bar_example_id', 'category_bebidas_id', 'Mojito', 'Mojito clásico con menta fresca', 12.00, true),
('bar_example_id', 'category_bebidas_id', 'Coca Cola', 'Refresco de cola 350ml', 4.50, true),

-- Comidas
('bar_example_id', 'category_comidas_id', 'Hamburguesa Clásica', 'Carne, lechuga, tomate, cebolla y papas', 18.00, true),
('bar_example_id', 'category_comidas_id', 'Pizza Margherita', 'Salsa de tomate, mozzarella y albahaca', 22.00, true),
('bar_example_id', 'category_comidas_id', 'Alitas BBQ', '8 alitas con salsa barbacoa', 15.50, true),

-- Postres
('bar_example_id', 'category_postres_id', 'Tiramisú', 'Postre italiano tradicional', 9.00, true),
('bar_example_id', 'category_postres_id', 'Helado de Vainilla', '2 bochas con salsa de chocolate', 6.50, true);
