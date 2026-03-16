const { runAgent } = require('../ai/agent');

const chat = async (req, res) => {

  try {

    const { message, history = [] } = req.body;
    const userId = req.user.id;

    const result = await runAgent(message, history, userId);

    const updatedHistory = result.messages.slice(history.length);

    res.json({
      reply: result.reply,
      newTurns: updatedHistory
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message || 'Agent error'
    });

  }

};

module.exports = { chat };