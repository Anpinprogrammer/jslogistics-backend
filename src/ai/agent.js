const Anthropic = require('@anthropic-ai/sdk');
const { tools } = require('./tools/tools');
const { executeTool } = require('./toolExecutor');
const { getSystemPrompt } = require('./systemPrompt');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
})





async function runAgent(message, history, userId) {
  const systemPrompt = getSystemPrompt();

  const messages = [
    ...history,
    { role: 'user', content: message }
  ];



  
  let response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    tools,
    messages
  });
  

  while (response.stop_reason === 'tool_use') {

    messages.push({
      role: 'assistant',
      content: response.content
    });

    const toolResults = [];

    for (const block of response.content) {

      if (block.type !== 'tool_use') continue;

      let result;

      try {
        result = await executeTool(block.name, block.input, userId);
      } catch (err) {
        result = { success: false, error: err.message };
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result)
      });
    }

    messages.push({
      role: 'user',
      content: toolResults
    });
     
    response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages
    });
    
  }

  const textBlock = response.content.find((b) => b.type === 'text');

  return {
    reply: textBlock ? textBlock.text : 'Done.',
    messages
  };
}

module.exports = { runAgent };