const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

async function extractMemoryAndRespond(message) {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct',
            response_format: { type: 'json_object' },
            messages: [
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
            ],
            temperature: 0.2,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

module.exports = { extractMemoryAndRespond };