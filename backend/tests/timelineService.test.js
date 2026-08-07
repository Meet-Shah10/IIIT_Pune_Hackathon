const test = require('node:test');
const assert = require('node:assert/strict');
const { buildTimelineEvent } = require('../services/timelineService');

test('buildTimelineEvent includes memory content, reason, and saved timestamp', () => {
  const event = {
    _id: 'evt_1',
    action: 'extracted',
    detail: 'Auto-extracted from chat: "Lives in Pune"',
    reason: 'User shared location information',
    createdAt: '2025-01-01T00:00:00.000Z',
    memoryId: 'memory_1',
  };

  const memory = {
    _id: 'memory_1',
    content: 'Lives in Pune',
    category: 'personal_details',
    sensitivity: 'medium',
    reasoning: 'User shared location information',
    source: 'chat',
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const result = buildTimelineEvent(event, memory);

  assert.equal(result.action, 'extracted');
  assert.equal(result.memoryContent, 'Lives in Pune');
  assert.equal(result.reason, 'User shared location information');
  assert.equal(result.savedAt, '2025-01-01T00:00:00.000Z');
  assert.equal(result.memory.category, 'personal_details');
  assert.match(result.detail, /Lives in Pune/);
});

test('buildTimelineEvent normalizes forgotten events with context', () => {
  const event = {
    _id: 'evt_2',
    action: 'forgotten',
    detail: 'User explicitly revoked this memory via dashboard.',
    createdAt: '2025-01-02T00:00:00.000Z',
    memoryId: 'memory_2',
  };

  const memory = {
    _id: 'memory_2',
    content: 'Prefers Python for backend work',
    category: 'preference',
    sensitivity: 'low',
    reasoning: 'User mentioned a coding preference',
    status: 'forgotten',
    createdAt: '2025-01-01T12:00:00.000Z',
  };

  const result = buildTimelineEvent(event, memory);

  assert.equal(result.action, 'forgotten');
  assert.equal(result.memoryContent, 'Prefers Python for backend work');
  assert.equal(result.reason, 'User mentioned a coding preference');
  assert.match(result.detail, /dashboard/);
});
