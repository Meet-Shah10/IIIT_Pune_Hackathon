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
            content: `{
  "reply": "Conversational response",
  "negotiation_prompt": {
    "content": "Normalized 3rd-person fact (e.g., 'User lives in Pune')",
    "category": "name|location|age|health|preference|habit|personal_details|educational|misc",
    "reason": "Brief extraction reason"
  }
}

Rules:
1. MEMORY TOGGLE CHECK (highest priority): 
   - If "memory_enabled" is false, ALWAYS set "negotiation_prompt" to null, 
     regardless of what personal information appears in the message. 
     Do not extract, infer, or flag anything.
   - Only proceed to Rules 2-5 if "memory_enabled" is true.

2. Extract ONLY durable, long-term personal facts explicitly or clearly 
   stated by the user — prioritize: name, location/place, age, and other 
   identifying personal details (occupation, health, relationships, 
   preferences, habits, education).

3. Ignore transient requests, temporary states, hypotheticals, or standard 
   chitchat (e.g., "I'm hungry right now" is NOT durable; 
   "I'm vegetarian" IS durable).

4. If no durable fact exists, OR if memory_enabled is false, set 
   "negotiation_prompt" to null.

5. Adhere strictly to any Language directive specified in the prompt for 
   the "reply" field.`
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