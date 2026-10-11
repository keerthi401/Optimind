/**
 * Catch-all handler for unregistered API routes.
 * Emits a structured JSON 404 response.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`,
    },
  });
}
