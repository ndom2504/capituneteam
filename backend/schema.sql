CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  role VARCHAR(20) CHECK (role IN ('client', 'conseiller', 'admin')) DEFAULT 'client',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dossiers (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  conseiller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(50) CHECK (type IN ('express_entry', 'study_permit', 'business_opportunity')) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  conseiller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  service_name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  deadline DATE,
  status VARCHAR(20) CHECK (status IN ('open', 'paid', 'in_progress', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  stripe_session_id VARCHAR(255),
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
