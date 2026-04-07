--- =================================================
--- Settlements table 
--- =================================================
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id UUID NOT NULL REFERENCES clients(id),

  total_paid NUMERIC NOT NULL,
  payment_method TEXT,
  notes TEXT,

  created_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT now()
);

--- =====================================================
--- Modify daily_summaries
--- =====================================================

ALTER TABLE daily_summaries
ADD COLUMN settlement_id UUID REFERENCES settlements(id);