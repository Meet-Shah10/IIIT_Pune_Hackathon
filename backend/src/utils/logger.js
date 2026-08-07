const prefix = (level) => `[${level}] [${new Date().toISOString()}]`

export const logger = {
  info: (...args) => console.log(prefix('INFO'), ...args),
  error: (...args) => console.error(prefix('ERROR'), ...args),
  warn: (...args) => console.warn(prefix('WARN'), ...args),
}
