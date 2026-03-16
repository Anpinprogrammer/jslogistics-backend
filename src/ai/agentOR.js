const OpenAi = require('openai');
const { tools } = require('./tools/tools');
const { executeTool } = require('./toolExecutor');
const { getSystemPrompt } = require('./systemPrompt');

const openrouter = new OpenAi({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY
})

async function runAgentOR(message, history, userId) {
  const systemPrompt = getSystemPrompt();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message }
  ];

  let response = await openrouter.chat.completions.create({
    model: "moonshotai/kimi-k2.5",
    messages,
    tools,
    max_tokens: 1000
  });

  // 1. Acceder al mensaje de forma correcta para OpenAI
  let choice = response.choices[0].message;

  // 2. Cambiar la condición del bucle (OpenAI usa finish_reason)
  while (response.choices[0].finish_reason === 'tool_calls') {
    
    messages.push(choice); // Guardamos la llamada a la herramienta en el historial

    const toolCalls = choice.tool_calls;

    for (const toolCall of toolCalls) {
      let result;
      try {
        // En OpenAI los argumentos vienen como string JSON
        const args = JSON.parse(toolCall.function.arguments);
        result = await executeTool(toolCall.function.name, args, userId);
      } catch (err) {
        result = { success: false, error: err.message };
      }

      // 3. Formato de respuesta de herramienta para OpenAI
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: JSON.stringify(result)
      });
    }

    // Volver a llamar al modelo con los resultados
    response = await openrouter.chat.completions.create({
      model: "moonshotai/kimi-k2.5",
      messages,
      tools,
      max_tokens: 1000
    });
    
    choice = response.choices[0].message;
  }

  // 4. Retornar el texto final de forma segura
  return {
    reply: choice.content || 'Operación completada.',
    messages
  };
}

module.exports = { runAgentOR }