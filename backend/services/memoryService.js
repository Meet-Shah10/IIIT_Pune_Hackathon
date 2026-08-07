const { chatCompletion } = require('../config/nvidia');

async function extractMemoryAndRespond(message, systemPrompt = '', recentHistory = []) {
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
    "category": "health|preference|habit|personal_details|educational|misc",
    "reason": "Brief extraction reason"
  }
}
Rules:
1. Extract ONLY durable, long-term personal facts.
2. Ignore transient requests, temporary states, or standard chitchat.
3. If no durable fact exists, set "negotiation_prompt" to null.
4. Adhere strictly to any Language directive specified in the prompt for the "reply" field.`
        }
    );

    // Prepend recent conversation history (last 10-15 messages)
    for (const msg of recentHistory) {
        if (msg.role && msg.content) {
            messages.push({ role: msg.role, content: msg.content });
        }
    }

    // Append current user message
    messages.push({ role: 'user', content: message });

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