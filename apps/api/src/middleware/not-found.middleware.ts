
import type {
  RequestHandler,
} from 'express'

const notFoundHandler: RequestHandler = (
  req,
  _res,
  next,
) => {
  try {
    const error = new Error(
      `Route not found: ${req.method} ${req.originalUrl}`,
    ) as Error & { status: number }

    error.status = 404

    next(error)
  } catch (error) {
    next(error)
  }
}

export default notFoundHandler
