CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(60) NOT NULL,
  order_type VARCHAR(30) NOT NULL DEFAULT 'pickup',
  total NUMERIC(10,2) NOT NULL,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'received',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL
);

INSERT INTO menu_items (name, description, category, price, image_url, is_featured)
SELECT 'Nordic Salmon', 'Citrus-cured salmon, dill emulsion, rye crisps', 'Starters', 18.50, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Nordic Salmon');

INSERT INTO menu_items (name, description, category, price, image_url, is_featured)
SELECT 'Truffle Ribeye', 'Prime ribeye, truffle jus, fondant potato', 'Mains', 42.00, 'https://images.unsplash.com/photo-1544025162-d76694265947', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Truffle Ribeye');

INSERT INTO menu_items (name, description, category, price, image_url, is_featured)
SELECT 'Wild Mushroom Risotto', 'Aged parmesan, black garlic, herb oil', 'Mains', 27.00, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601', FALSE
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Wild Mushroom Risotto');

INSERT INTO menu_items (name, description, category, price, image_url, is_featured)
SELECT 'Vanilla Crème Brûlée', 'Madagascar vanilla custard, seasonal berries', 'Desserts', 12.00, 'https://images.unsplash.com/photo-1551024601-bec78aea704b', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Vanilla Crème Brûlée');
