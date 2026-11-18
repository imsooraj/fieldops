
import { Router } from 'express'

const healthRouter = Router()

healthRouter.get('/', (_req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'FieldOps API is running',
    })
  } catch (error) {
    console.error('Health check failed:', error)

    res.status(500).json({
      success: false,
      message: 'Health check failed',
    })
  }
})

export default healthRouter
