const { pool } = require('../config/database');
const { getTodayBogota, getWeekDatesBogota } = require('../utils/dateUtils');

const actualizarDailySummary = async (delivery) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const fecha = delivery.delivery_date; // 🔥 usamos esto

    // 1. Buscar o crear summary
    let summary = await client.query(
      `SELECT id FROM daily_summaries
       WHERE client_id = $1 AND date = $2`,
      [delivery.client_id, fecha]
    );

    let summaryId;

    if (summary.rows.length === 0) {
      const insert = await client.query(
        `INSERT INTO daily_summaries (client_id, date)
         VALUES ($1, $2)
         RETURNING id`,
        [delivery.client_id, fecha]
      );

      summaryId = insert.rows[0].id;
    } else {
      summaryId = summary.rows[0].id;
    }

    // 2. Asociar delivery
    await client.query(
      `UPDATE deliveries
       SET daily_summary_id = $1
       WHERE id = $2`,
      [summaryId, delivery.id]
    );

    // 3. Recalcular totales
    await client.query(
      `UPDATE daily_summaries ds
       SET 
         total_collected = sub.total_collected,
         total_services = sub.total_services,
         net = sub.net
       FROM (
         SELECT 
           daily_summary_id,
           COALESCE(SUM(received_amount), 0) AS total_collected,
           COALESCE(SUM(service_value), 0) AS total_services,
           COALESCE(SUM(received_amount), 0) - COALESCE(SUM(service_value), 0) AS net
         FROM deliveries
         WHERE daily_summary_id = $1
           AND status = 'completed'
         GROUP BY daily_summary_id
       ) sub
       WHERE ds.id = sub.daily_summary_id`,
      [summaryId]
    );

    await client.query("COMMIT");

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getAllClients = async (req, res) => {

} 

const addClientSettlement = async (req, res) => {

}

module.exports = { actualizarDailySummary, getAllClients, addClientSettlement }