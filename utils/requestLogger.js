// utils/requestLogger.js
const { v4: uuidv4 } = require('uuid');

/**
 * Custom middleware that logs every incoming request with a unique ID and response time.
 */
function requestLogger(req, res, next) {
  const requestId = uuidv4();
  req.requestId = requestId;

  const start = Date.now();

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsed}ms`
    );
  });

  next();
}

module.exports = requestLogger;
