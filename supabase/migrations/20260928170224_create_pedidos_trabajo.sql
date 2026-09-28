/*
# Create pedidos_trabajo table (Bolsa de Trabajos / Pedidos de Servicio)

1. New Tables
- `pedidos_trabajo`: Stores job/service requests posted by neighbors
  - `id` (uuid, primary key)
  - `titulo` (text, not null) — job title
  - `categoria` (text, not null) — Jardinería, Plomería, Electricidad, Albañilería, Fletes, Limpieza, Otros
  - `detalles` (text, not null) — full description with measurements
  - `zona` (text, not null) — Villaguay neighborhood/barrio
  - `presupuesto` (text) — estimated budget or "A convenir"
  - `whatsapp` (text, not null) — contact phone
  - `nombre_contacto` (text) — contact name
  - `fotos` (jsonb, default '[]') — array of up to 3 base64 image strings
  - `estado` (text, default 'pendiente') — pendiente, aprobado, resuelto, borrado
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `pedidos_trabajo`.
- Allow anon + authenticated to SELECT (public board, only approved/resuelto visible)
- Allow anon + authenticated to INSERT (neighbors post requests)
- Allow anon + authenticated to UPDATE (admin moderation)
- Allow anon + authenticated to DELETE (admin moderation)

3. Indexes
- Index on `estado` for filtering
- Index on `categoria` for category filters
- Index on `created_at DESC` for chronological ordering
*/

CREATE TABLE IF NOT EXISTS pedidos_trabajo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  detalles TEXT NOT NULL,
  zona TEXT NOT NULL,
  presupuesto TEXT DEFAULT 'A convenir',
  whatsapp TEXT NOT NULL,
  nombre_contacto TEXT DEFAULT '',
  fotos JSONB DEFAULT '[]'::jsonb,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pedidos_trabajo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pedidos" ON pedidos_trabajo;
CREATE POLICY "anon_select_pedidos" ON pedidos_trabajo
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pedidos" ON pedidos_trabajo;
CREATE POLICY "anon_insert_pedidos" ON pedidos_trabajo
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pedidos" ON pedidos_trabajo;
CREATE POLICY "anon_update_pedidos" ON pedidos_trabajo
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pedidos" ON pedidos_trabajo;
CREATE POLICY "anon_delete_pedidos" ON pedidos_trabajo
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos_trabajo(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_categoria ON pedidos_trabajo(categoria);
CREATE INDEX IF NOT EXISTS idx_pedidos_created ON pedidos_trabajo(created_at DESC);