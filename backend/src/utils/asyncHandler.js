/**
 * Wraps an async route handler or middleware to forward rejections to Express error handling.
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
