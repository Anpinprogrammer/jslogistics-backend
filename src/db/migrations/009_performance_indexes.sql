-- ============================================================
-- Migration 009: Performance indexes for hot query paths
-- Run once against the production DB.
-- All indexes use IF NOT EXISTS — safe to re-run.
-- ============================================================

-- daily_settlements: most queries filter by courier + date together
CREATE INDEX IF NOT EXISTS idx_daily_settlements_courier_date
  ON daily_settlements(courier_id, date DESC);

-- daily_settlements: filter by date alone (e.g. "today's settlements")
CREATE INDEX IF NOT EXISTS idx_daily_settlements_date
  ON daily_settlements(date DESC);

-- deliveries: composite for courier + status (daily settlement queries)
CREATE INDEX IF NOT EXISTS idx_deliveries_courier_status
  ON deliveries(courier_id, status);

-- deliveries: composite for courier + date (daily view)
CREATE INDEX IF NOT EXISTS idx_deliveries_courier_date
  ON deliveries(courier_id, delivery_date DESC);

-- deliveries: date range queries used in weekly/consolidated reports
CREATE INDEX IF NOT EXISTS idx_deliveries_week
  ON deliveries(week_start, week_end);

-- salary_advances: weekly payroll queries filter by courier + week
CREATE INDEX IF NOT EXISTS idx_salary_advances_courier_week
  ON salary_advances(courier_id, week_start);

-- partial_deliveries: daily settlement queries filter by courier + date
CREATE INDEX IF NOT EXISTS idx_partial_deliveries_courier_date
  ON partial_deliveries(courier_id, date DESC);

-- delivery_audit_log: audit page filters by delivery_id
CREATE INDEX IF NOT EXISTS idx_audit_log_delivery_id
  ON delivery_audit_log(delivery_id);

-- delivery_audit_log: audit page also orders by created_at
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON delivery_audit_log(created_at DESC);

-- operational_charges: daily cash report filters by date
CREATE INDEX IF NOT EXISTS idx_operational_charges_date
  ON operational_charges(date DESC);

-- weekly_settlements: payroll page queries by courier + week
CREATE INDEX IF NOT EXISTS idx_weekly_settlements_courier_week
  ON weekly_settlements(courier_id, week_start);
