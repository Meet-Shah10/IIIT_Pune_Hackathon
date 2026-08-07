// backend/config/nvidia.js
// Centralised configuration for NVIDIA NIM API integration.
// The environment variable NVIDIA_API_KEY must be defined in .env (git‑ignored).

require('dotenv').config();

module.exports = {
  // Base endpoint for chat completions (used in memoryService)
  BASE_URL: 'https://integrate.api.nvidia.com/v1/chat/completions',
  // Default model used for memory extraction
  DEFAULT_MODEL: 'meta/llama-3.1-8b-instruct',
  // API key – pulled from process.env at runtime
  API_KEY: process.env.NVIDIA_API_KEY,
};
