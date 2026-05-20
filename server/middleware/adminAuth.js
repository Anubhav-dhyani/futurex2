import jwt from 'jsonwebtoken'

export function requireAdminAuth(request, response, next) {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET)
    request.admin = payload
    next()
  } catch (_error) {
    response.status(401).json({ message: 'Invalid token' })
  }
}
