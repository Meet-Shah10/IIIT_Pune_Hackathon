const { chatCompletion } = require('../config/nvidia');

async function extractMemoryAndRespond(message, systemPrompt = '') {
    // Build messages array – prepend context system prompt if provided
    const messages = [];

    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push(
        {
            role: 'system',
            content: `Respond to the user and extract persistent long-term facts (identity, preferences, health, relationships, goals, constraints). Output strictly valid JSON:
{
  "reply": "Conversational response",
  "negotiation_prompt": {
    "content": "Normalized 3rd-person fact (e.g., 'User lives in Pune')",
    "category": "health|preference|habit|personal_details|misc",
    "reason": "Brief extraction reason"
  }
}
Rules:
1. Extract ONLY durable, long-term personal facts.
2. Ignore transient requests, temporary states, or standard chitchat.
3. If no durable fact exists, set "negotiation_prompt" to null.`
        },
        { role: 'user', content: message }
    );

    // Use shared chatCompletion helper for consistent configuration
    const content = await chatCompletion(messages, {
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: 'json_object' }
    });
    // chatCompletion returns the LLM's message content as a string
    try {
        return JSON.parse(content);
    } catch (err) {
        throw new Error(`Failed to parse JSON from LLM response: ${err.message}`);
    }
}

module.exports = { extractMemoryAndRespond };