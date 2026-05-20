import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.BASE_URL}api`

const api = axios.create({
  baseURL: apiBaseUrl,
})

export default api
