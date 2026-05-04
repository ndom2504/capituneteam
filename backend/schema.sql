CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_photo_url VARCHAR(500),
  role VARCHAR(20) CHECK (role IN ('client', 'conseiller', 'admin')) DEFAULT 'client',
  account_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migration: Add new columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';

-- Drop existing dossiers table if it exists with old structure
DROP TABLE IF EXISTS dossiers CASCADE;

CREATE TABLE dossiers (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  conseiller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  programme VARCHAR(50) CHECK (programme IN ('entree_express', 'permis_etude', 'affaires')) NOT NULL,
  titre VARCHAR(255),
  statut VARCHAR(20) CHECK (statut IN ('brouillon', 'envoye', 'accepte', 'refuse')) DEFAULT 'brouillon',
  data JSONB,
  file_url VARCHAR(500),
  refusal_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS titre VARCHAR(255);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  conseiller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  scope TEXT,
  conditions TEXT,
  price NUMERIC(10, 2) NOT NULL,
  deadline DATE,
  status VARCHAR(30) DEFAULT 'en_attente_paiement',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS conditions TEXT;
ALTER TABLE tickets ALTER COLUMN status TYPE VARCHAR(30);
ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'en_attente_paiement';

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
  stripe_payment_intent_id VARCHAR(255),
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'initie',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(20);
ALTER TABLE payments ALTER COLUMN status SET DEFAULT 'initie';

CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255),
  content TEXT,
  media_url VARCHAR(500),
  media_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_likes (
  post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);
