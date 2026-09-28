/*
# Create oficios table (Directorio de Oficios y Changas)

1. New Tables
- `oficios`: Stores worker/service provider profiles for the directory
  - `id` (uuid, primary key)
  - `name` (text, not null) — name or nickname
  - `trade` (text, not null) — trade/specialty
  - `zone` (text, not null) — area of service
  - `whatsapp` (text, not null) — WhatsApp contact link
  - `bio` (text) — description of services
  - `rating` (numeric, default 5.0) — rating score
  - `reviews` (int, default 0) — number of reviews
  - `medal` (text, default 'nuevo') — medal type (oro, plata, bronce, recomendado, nuevo)
  - `available` (boolean, default true) — currently available
  - `estado` (text, default 'pendiente') — pendiente, aprobado, rechazado
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `oficios`.
- Allow anon + authenticated SELECT (public directory)
- Allow anon + authenticated INSERT (users submit requests)
- Allow anon + authenticated UPDATE (admin moderation)
- Allow anon + authenticated DELETE (admin moderation)

3. Indexes
- Index on `estado` for filtering
- Index on `rating DESC` for ranking
- Index on `trade` for category filtering
*/

CREATE TABLE IF NOT EXISTS oficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  zone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  bio TEXT DEFAULT '',
  rating NUMERIC DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  medal TEXT DEFAULT 'nuevo',
  available BOOLEAN DEFAULT true,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE oficios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_oficios" ON oficios;
CREATE POLICY "anon_select_oficios" ON oficios
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_oficios" ON oficios;
CREATE POLICY "anon_insert_oficios" ON oficios
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_oficios" ON oficios;
CREATE POLICY "anon_update_oficios" ON oficios
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_oficios" ON oficios;
CREATE POLICY "anon_delete_oficios" ON oficios
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_oficios_estado ON oficios(estado);
CREATE INDEX IF NOT EXISTS idx_oficios_rating ON oficios(rating DESC);
CREATE INDEX IF NOT EXISTS idx_oficios_trade ON oficios(trade);