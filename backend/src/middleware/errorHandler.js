/**
 * Centralized Express error handler
 * All errors → { success: false, error: string }
 * Per TECH_SPEC.md: never return 200 with error buried in body
 */
export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  console.error(`[ERROR] ${status} — ${message}`)
  res.status(status).json({ success: false, error: message })
}
