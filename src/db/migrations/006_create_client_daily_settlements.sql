---- ===============================================================
-- Tabla para los resumenes diarios
---- ===============================================================

CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  date DATE NOT NULL,

  total_collected NUMERIC DEFAULT 0,
  total_services NUMERIC DEFAULT 0,
  total_loans NUMERIC DEFAULT 0,
  net NUMERIC DEFAULT 0,

  is_settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMPTZ,
  settled_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (client_id, date)
);

--- ===============================================================
--- Modificacion a la tabla actual de deliveries
--- ===============================================================
ALTER TABLE deliveries
ADD COLUMN daily_summary_id UUID REFERENCES daily_summaries(id) ON DELETE SET NULL;