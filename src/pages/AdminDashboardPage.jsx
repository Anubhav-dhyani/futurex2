import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('futurex_admin_token')

    if (!token) {
      navigate('/admin')
      return
    }

    api
      .get('/forms', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setEntries(response.data))
      .catch(() => {
        localStorage.removeItem('futurex_admin_token')
        setMessage('Session expired. Please login again.')
        navigate('/admin')
      })
  }, [navigate])

  async function handleDownload() {
    const token = localStorage.getItem('futurex_admin_token')
    const response = await api.get('/forms/export', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    })

    const url = URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'futurex-applications.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleLogout() {
    localStorage.removeItem('futurex_admin_token')
    navigate('/admin')
  }

  return (
    <main className="admin-shell">
      <section className="dashboard-card">
        <div className="dashboard-header">
          <h1>Applications</h1>
          <div className="dashboard-actions">
            <button type="button" onClick={handleDownload}>
              Download Data
            </button>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {message ? <p className="status-message">{message}</p> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>DOB</th>
                <th>Mobile</th>
                <th>Parent Mobile</th>
                <th>Email</th>
                <th>School</th>
                <th>City</th>
                <th>State</th>
                <th>Stream</th>
                <th>Class</th>
                <th>Consent</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id}>
                  <td>{entry.name}</td>
                  <td>{formatDate(entry.dob)}</td>
                  <td>{entry.countryCode}{entry.mobile}</td>
                  <td>{entry.parentMobile}</td>
                  <td>{entry.email}</td>
                  <td>{entry.schoolName}</td>
                  <td>{entry.city}</td>
                  <td>{entry.state}</td>
                  <td>{entry.stream || '-'}</td>
                  <td>{entry.studentClass}</td>
                  <td>{entry.indemnityAgreed ? 'Yes' : 'No'}</td>
                  <td>{formatDateTime(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default AdminDashboardPage
