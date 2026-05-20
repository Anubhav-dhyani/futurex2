import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/admin/login', { email, password })
      localStorage.setItem('futurex_admin_token', response.data.token)
      navigate('/admin/dashboard')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="admin-shell">
      <form className="admin-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Admin email" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />
        {message ? <p className="status-message">{message}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </main>
  )
}

export default AdminLoginPage
