import bcrypt from 'bcryptjs'
import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/admin/login', async (request, response) => {
  const { email, password } = request.body

  if (!email || !password) {
    return response.status(400).json({ message: 'Email and password are required.' })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  const isEmailValid = email === adminEmail
  const isPasswordValid = adminPasswordHash
    ? await bcrypt.compare(password, adminPasswordHash)
    : password === adminPassword

  if (!isEmailValid || !isPasswordValid) {
    return response.status(401).json({ message: 'Invalid credentials.' })
  }

  const token = jwt.sign({ email }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: '12h',
  })

  response.json({ token })
})

export default router
