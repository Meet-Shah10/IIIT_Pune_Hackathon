const test = require('node:test');
const assert = require('node:assert/strict');
const Message = require('../models/Message');

test('Message schema accepts session-based chat records', async () => {
  const message = new Message({
    sessionId: 'session-123',
    role: 'user',
    content: 'Hello there',
    createdAt: new Date(),
    wasFactExtracted: false,
    expiresAt: null,
  });

  await assert.doesNotReject(() => message.validate());
  assert.equal(message.sessionId, 'session-123');
  assert.equal(message.role, 'user');
  assert.equal(message.content, 'Hello there');
});

test('Message schema accepts assistant role records', async () => {
  const message = new Message({
    sessionId: 'session-456',
    role: 'assistant',
    content: 'Hi back!',
  });

  await assert.doesNotReject(() => message.validate());
  assert.equal(message.role, 'assistant');
});
