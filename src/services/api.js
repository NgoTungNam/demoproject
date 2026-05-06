import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const API_URL = `${API_BASE_URL}/api`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Product APIs
export const productAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId) => api.get(`/products`, { params: { categoryId } }),
  search: (keyword) => api.get(`/products/search`, { params: { q: keyword } }),
  create: (formData) => api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
}

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
}

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
}

// Order APIs
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
}

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
}

export default api
