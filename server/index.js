import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import path from 'path'
import authRouter from './routes/auth.js'
import formsRouter from './routes/forms.js'
import otpRouter from './routes/otp.js'

dotenv.config()
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') })

const app = express()
const port = Number(process.env.SERVER_PORT || 4000)
const clientOrigin = getClientOrigin(process.env.CLIENT_ORIGIN || 'http://localhost:5173')
const appBasePath = normalizeBasePath(process.env.APP_BASE_PATH || process.env.VITE_APP_BASE_PATH || '')
const distPath = path.join(process.cwd(), 'dist')

app.use(
  cors({
    origin: clientOrigin,
  }),
)
app.use(express.json())

mountApiRoutes('')

if (appBasePath) {
  mountApiRoutes(appBasePath)
  app.use(appBasePath, express.static(distPath))
  app.get(new RegExp(`^${escapeRegExp(appBasePath)}(?:/.*)?$`), (_request, response) => {
    response.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  app.use(express.static(distPath))
}

function getClientOrigin(value) {
  try {
    return new URL(value).origin
  } catch {
    return value
  }
}

function mountApiRoutes(prefix) {
  app.get(`${prefix}/api/health`, (_request, response) => {
    response.json({ ok: true })
  })

  app.use(`${prefix}/api/auth`, authRouter)
  app.use(`${prefix}/api/forms`, formsRouter)
  app.use(`${prefix}/api/otp`, otpRouter)
}

function normalizeBasePath(value) {
  const basePath = value.trim()

  if (!basePath || basePath === '/') {
    return ''
  }

  return `/${basePath.replace(/^\/+|\/+$/g, '')}`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

startServer()
