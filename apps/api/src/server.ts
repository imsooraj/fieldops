
import express from 'express'

const app = express()

const PORT = Number(process.env.PORT) || 5000

// Middleware to parse incoming JSON requests
app.use(express.json())

// Basic health-check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'FieldOps API is running',
  })
})

async function startServer(): Promise<void> {
  try {
    const server = app.listen(PORT, () => {
      console.log(`FieldOps API running on http://localhost:${PORT}`)
    })

    server.on('error', (error) => {
      console.error('Server startup error:', error)
    })
  } catch (error) {
    console.error('Failed to start FieldOps API:', error)
    process.exitCode = 1
  }
}

startServer()
