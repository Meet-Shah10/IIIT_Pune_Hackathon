// backend/middleware/userId.js
module.exports = (req, res, next) => {
  const headerId = req.headers['x-user-id'];
  if (headerId) {
    // Ensure body exists
    if (typeof req.body !== 'object' || req.body === null) req.body = {};
    if (!req.body.userId) req.body.userId = headerId;
    // Ensure params exists
    if (typeof req.params !== 'object' || req.params === null) req.params = {};
    if (!req.params.userId) req.params.userId = headerId;
  }
  next();
};
