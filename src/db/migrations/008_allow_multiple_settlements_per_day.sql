--- ===============================================================
--- Allow multiple settlements per day per client
--- Removes the unique constraint so a client can be settled
--- multiple times in the same day. New deliveries after a
--- settlement will create a fresh summary even on the same date.
--- ===============================================================

ALTER TABLE daily_summaries
DROP CONSTRAINT daily_summaries_client_id_date_key;
