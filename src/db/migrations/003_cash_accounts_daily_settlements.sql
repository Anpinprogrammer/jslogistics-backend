-- ============================================
-- Enumaracion de tipo de cuentas 
--  Enumaracion por ingreso o gasto
-- ============================================
CREATE TYPE company_account AS ENUM ('cash', 'bancolombia', 'nequi');

CREATE TYPE transaction_type AS ENUM ('opening_balance', 'income', 'expense');


-- ============================================
-- Tabla: daily_base_money_js
-- ============================================
CREATE TABLE IF NOT EXISTS company_money_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account company_account NOT NULL,
  type transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX unique_opening_balance_per_day
ON company_money_movements(account, date)
WHERE type = 'opening_balance';