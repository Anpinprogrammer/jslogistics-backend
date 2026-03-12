-- ========================================================
-- Se agrega columna para manejar los pagos por adelantado
-- ========================================================

ALTER TABLE deliveries
ADD COLUMN advanced_payment BOOLEAN DEFAULT false;