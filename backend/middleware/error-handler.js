export function errorHandler(err, _req, res, _next) {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
