const { runAgent } = require('../ai/agent');
const { runAgentOR } = require('../ai/agentOR');

const chat = async (req, res) => {

  try {

    const { message, history = [] } = req.body;
    const userId = req.user.id;

    const result = await runAgentOR(message, history, userId);

    /**
     * 
     
    let result;
    if(process.env.NODE_ENV === 'production') {
      result = await runAgent(message, history, userId);
    } else if (process.env.NODE_ENV === 'developing'){
      result = await runAgentOR(message, history, userId);
    }
    */

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