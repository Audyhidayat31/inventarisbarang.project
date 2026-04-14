-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
  location VARCHAR(255),
  condition VARCHAR(50) DEFAULT 'baik' CHECK (condition IN ('baik', 'rusak')),
  image_url TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for auth
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_condition ON items(condition);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Elektronik', 'Perangkat elektronik seperti komputer, printer, dll'),
  ('Furniture', 'Meja, kursi, lemari, dan perabotan lainnya'),
  ('Alat Tulis', 'Perlengkapan kantor dan alat tulis'),
  ('Kendaraan', 'Mobil, motor, dan kendaraan operasional'),
  ('Lainnya', 'Barang-barang yang tidak termasuk kategori di atas')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: admin123)
-- Note: This uses bcrypt hash for 'admin123'
INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@inventory.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQHLVt5/c3t5a3.YqCuPmVrUQEBB6W', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;
