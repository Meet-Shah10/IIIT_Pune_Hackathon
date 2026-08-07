/**
 * asyncHandler — wraps async route handlers to forward errors to Express errorHandler
 * Per TECH_SPEC.md: every async route must be wrapped here, no repeated try/catch
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
