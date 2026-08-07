// src/utils/userSession.js
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'userId';
const SESSION_ID_KEY = 'sessionId';

export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `user_${uuidv4()}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getSessionId() {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `session_${uuidv4()}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}
