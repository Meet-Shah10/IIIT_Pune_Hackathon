// backend/config/nvidia.js
// Centralised configuration for NVIDIA NIM API integration.
// The environment variable NVIDIA_API_KEY must be defined in .env (git‑ignored).

require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function chatCompletion(messages, options = {}) {
    const { temperature, max_tokens, response_format, jsonMode, model } = options;
    const body = {
        model: model || module.exports.DEFAULT_MODEL,
        messages,
        ...(temperature !== undefined ? { temperature } : {}),
        ...(max_tokens !== undefined ? { max_tokens } : {}),
        ...(response_format ? { response_format } : {}),
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };

    const response = await fetch(module.exports.BASE_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${module.exports.API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

module.exports = {
    // Base endpoint for chat completions (used in memoryService)
    BASE_URL: 'https://integrate.api.nvidia.com/v1/chat/completions',
    DEFAULT_MODEL: 'nvidia/nemotron-nano-9b-v2-2207',
    API_KEY: process.env.NVIDIA_API_KEY,
    chatCompletion,
};
