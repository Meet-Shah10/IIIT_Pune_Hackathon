import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSessionId } from './userSession.js';

test('buildSessionId returns a new session id string', () => {
  const id = buildSessionId();
  assert.equal(typeof id, 'string');
  assert.match(id, /^session_/);
});
