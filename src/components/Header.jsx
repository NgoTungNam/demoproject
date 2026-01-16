import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const navigate = useNavigate()
  const { getCartItemsCount } = useCart()
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="bg-white shadow-sm sticky-top">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary fs-3" to="/">
            <i className="bi bi-fire"></i> EuroAsia
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Trang Chủ
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">
                  Sản Phẩm
                </Link>
              </li>
            </ul>

            <form className="d-flex me-3" onSubmit={handleSearch}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </form>

            <div className="d-flex align-items-center">
              <Link
                to="/cart"
                className="btn btn-outline-primary position-relative me-3"
              >
                <i className="bi bi-cart3"></i>
                {getCartItemsCount() > 0 && (
                  <span className="cart-badge">{getCartItemsCount()}</span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i> {user?.name}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                    {isAdmin && (
                      <>
                        <li><Link className="dropdown-item" to="/admin/dashboard"><strong>Admin Dashboard</strong></Link></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                    <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
                  </ul>
                </div>
              ) : (
                <div>
                  <Link to="/login" className="btn btn-outline-secondary me-2">Login</Link>
                  <Link to="/register" className="btn btn-primary">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header

