import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import ProductCreate from './pages/ProductCreate'

// Auth & Admin
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import UserProfile from './pages/User/UserProfile'
import AdminLayout from './components/AdminLayout'
import AdminProducts from './pages/Admin/AdminProducts'
import AdminCategories from './pages/Admin/AdminCategories'
import AdminOrders from './pages/Admin/AdminOrders'
import AdminPromotions from './pages/Admin/AdminPromotions'
import AdminCustomers from './pages/Admin/AdminCustomers'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Main Public Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected User Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<div className="text-center mt-5"><h2>Welcome to Admin Dashboard</h2></div>} />
              <Route path="dashboard" element={<div className="text-center mt-5"><h2>Welcome to Admin Dashboard</h2></div>} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="promotions" element={<AdminPromotions />} />
              {/* Admin Edit Routes */}
              <Route path="product/edit/:id" element={<ProductCreate />} />
            </Route>

            {/* Product creation and edit routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/product/new" element={
                <ProtectedRoute adminOnly={true}>
                  <ProductCreate />
                </ProtectedRoute>
              } />
              {/* Also for the Edit route if we want it to look like the public site context */}
              <Route path="/admin/product/edit/:id" element={
                <ProtectedRoute adminOnly={true}>
                  <ProductCreate />
                </ProtectedRoute>
              } />
            </Route>

          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
