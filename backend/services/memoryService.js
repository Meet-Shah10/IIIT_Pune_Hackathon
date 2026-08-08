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
  } STRICTLY FOLLOW THE SPECIFIED CATEGORIES NOT ANOTHER CATEGORY IN THE JSON OBJECT
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
        max_tokens: 1024,
        response_format: { type: 'json_object' }
    });
    // Clean out reasoning tags, markdown fences, or extra text surrounding JSON
    let cleaned = (content || '')
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }

    try {
        const parsed = JSON.parse(cleaned);
        let reply = parsed.reply || parsed.response || parsed.message || parsed.content || parsed.text || parsed.answer || parsed.explanation || parsed.result || parsed.joke;

        if (!reply) {
            const stringKeys = Object.keys(parsed).filter(k => k !== 'negotiation_prompt' && typeof parsed[k] === 'string');
            if (stringKeys.length > 0) {
                reply = parsed[stringKeys[0]];
            }
        }

        reply = reply || 'I am processing your request.';

        return {
            ...parsed,
            reply
        };
    } catch (err) {
        console.error('Failed to parse JSON from LLM response. Raw content:', content);
        return {
            reply: cleaned || 'I am processing your request.',
            negotiation_prompt: null
        };
    }
}

async function generateSessionTitle(firstPrompt) {
    try {
        const messages = [
            {
                role: 'system',
                content: 'You are a chat title generator. Generate a concise, suitable topic title (maximum 3-5 words) based on the user prompt. Return ONLY the title text, with no quotes, formatting, or extra words.'
            },
            {
                role: 'user',
                content: firstPrompt
            }
        ];
        const title = await chatCompletion(messages, {
            temperature: 0.1,
            max_tokens: 150,
            model: 'nvidia/nvidia-nemotron-nano-9b-v2'
        });
        const cleanTitle = (title || '').trim().replace(/^["']|["']$/g, '');
        return cleanTitle || 'New Chat';
    } catch (err) {
        console.error('Failed to generate session title:', err);
        return 'New Chat';
    }
}

module.exports = { extractMemoryAndRespond, generateSessionTitle };