// utils/requestLogger.js
import { v4 as uuidv4 } from 'uuid'

export const requestLogger = (req, res, next) => {
  const id = uuidv4()
  req.requestId = id
  const start = Date.now()

  res.on('finish', () => {
    const elapsed = Date.now() - start
    console.log(
      `[${new Date().toISOString()}] [${id}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsed}ms`
    )
  })

  next()
}
