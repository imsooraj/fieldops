
import type {
  Request,
  Response,
  NextFunction,
} from 'express'

function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const startTime = Date.now()

    console.log(
      `[REQUEST] ${req.method} ${req.originalUrl}`,
    )

    res.on('finish', () => {
      try {
        const duration = Date.now() - startTime

        console.log(
          `[RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`,
        )
      } catch (error) {
        console.error('Request logging failed:', error)
      }
    })

    next()
  } catch (error) {
    console.error('Request logger middleware failed:', error)
    next(error)
  }
}

export default requestLogger
