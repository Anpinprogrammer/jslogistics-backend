-- =======================================
-- Edicion tabla deliveries
-- =======================================
ALTER TABLE deliveries
ADD COLUMN loan NUMERIC DEFAULT 0,
ADD COLUMN lost_trips NUMERIC DEFAULT 0;

-- ======================================
-- Edicion tabla clients
-- ======================================
ALTER TABLE clients
ADD COLUMN service_lost_trips NUMERIC DEFAULT 0;