const { getTodayBogota, getWeekDatesBogota } = require('../utils/dateUtils');
const { settleClient } = require('../services/settlementsService');

const getClientSettlements = async (req, res) => {

} 

const addClientSettlement = async (req, res) => {
  const { id } = req.params
  const { paymentMethod, type, amount, notes } = req.body;
  
  try {
    
    const result = await settleClient({
      clientId: id,
      paymentMethod,
      type,
      amount,
      notes,
      userId: req.user.id
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

module.exports = { getClientSettlements, addClientSettlement }