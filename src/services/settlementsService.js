const { pool } = require('../config/database');

const actualizarDailySummary = async (delivery) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const fecha = delivery.delivery_date; // 🔥 usamos esto

    // 1. Buscar o crear summary (solo busca en los no liquidados para que
    //    una nueva entrega después de un cuadre abra un período nuevo)
    let summary = await client.query(
      `SELECT id FROM daily_summaries
       WHERE client_id = $1 AND date = $2 AND is_settled = FALSE`,
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
         total_loans = sub.total_loans,
         net = sub.net
       FROM (
         SELECT 
           daily_summary_id,
           COALESCE(SUM(received_amount), 0) AS total_collected,
           COALESCE(SUM(service_value), 0) AS total_services,
           COALESCE(SUM(loan), 0) AS total_loans,
           COALESCE(SUM(received_amount), 0) - COALESCE(SUM(service_value), 0) - COALESCE(SUM(loan), 0) AS net
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

const settleClient = async ({ clientId, paymentMethod, type, amount, notes, userId, summaryIds }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Obtener deuda pendiente (por IDs específicos o todos los pendientes)
    let pending;
    if (summaryIds && summaryIds.length > 0) {
      pending = await client.query(
        `SELECT id, net
         FROM daily_summaries
         WHERE client_id = $1
           AND is_settled = FALSE
           AND id = ANY($2)`,
        [clientId, summaryIds]
      );
    } else {
      pending = await client.query(
        `SELECT id, net
         FROM daily_summaries
         WHERE client_id = $1
           AND is_settled = FALSE`,
        [clientId]
      );
    }

    if (pending.rows.length === 0) {
      throw new Error("No hay deuda pendiente");
    }

    // 2. Calcular total
    const totalPaid = pending.rows.reduce(
      (acc, row) => acc + Number(row.net),
      0
    );

    // 3. Crear settlement
    const settlement = await client.query(
      `
      INSERT INTO settlements (client_id, total_paid, payment_method, notes, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [clientId, totalPaid, paymentMethod, notes, userId]
    );

    const settlementId = settlement.rows[0].id;
    const settledIds = pending.rows.map(r => r.id);

    // 4. Marcar los summaries seleccionados como liquidados
    await client.query(
      `UPDATE daily_summaries
       SET
         is_settled = TRUE,
         settled_at = now(),
         settlement_id = $1
       WHERE id = ANY($2)`,
      [settlementId, settledIds]
    );

    // 5. Resetear balance (opcional)
    await client.query(
      `
      UPDATE clients
      SET balance = 0
      WHERE id = $1
      `,
      [clientId]
    );

    // 6. Registra el movimiento en la caja de la empresa
    await client.query(
       `
        INSERT INTO company_money_movements
        (account, type, amount, created_by, date, notes)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)
        RETURNING *
        `,
        [paymentMethod, type, amount, userId, notes || null] 
    )

    await client.query("COMMIT");

    return {
      settlementId,
      totalPaid
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { actualizarDailySummary , settleClient };