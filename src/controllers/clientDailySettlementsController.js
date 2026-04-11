const { settleClient } = require('../services/settlementsService');
const { pool } = require('../config/database');

const getClientSettlements = async (req, res) => {

}

const getClientUnsettledSummaries = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, date, total_collected, total_services, total_loans, net, created_at
       FROM daily_summaries
       WHERE client_id = $1 AND is_settled = FALSE
       ORDER BY date ASC, created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addClientSettlement = async (req, res) => {
  const { id } = req.params
  const { paymentMethod, type, amount, notes, summaryIds } = req.body;

  try {
    const result = await settleClient({
      clientId: id,
      paymentMethod,
      type,
      amount,
      notes,
      userId: req.user.id,
      summaryIds,
    })

    res.json({
      message: "Cliente liquidado correctamente",
      ...result
    });

  } catch (error) {
    res.status(400).json({
      error: error.message
    })
  }
}

module.exports = { getClientSettlements, getClientUnsettledSummaries, addClientSettlement }
