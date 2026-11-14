import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { productAPI } from '../services/api'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartLoaded, setCartLoaded] = useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem('euroasia_cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart data", error);
        localStorage.removeItem('euroasia_cart');
      }
    }
    setCartLoaded(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('euroasia_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const refreshCartPrices = useCallback(async () => {
    if (!cartItems.length) return null
    try {
      const { data } = await productAPI.quotePrices(cartItems.map(({ id, quantity }) => ({ id, quantity })))
      const latest = new Map((data.items || []).map(item => [Number(item.id), item]))
      setCartItems(current => {
        let changed = false
        const numericKeys = new Set(['price', 'current_price', 'original_price', 'flash_remaining', 'discount_percent', 'stock', 'rating_average', 'review_count'])
        const updated = current.map(item => {
        const priceData = latest.get(Number(item.id))
        if (!priceData) return item
        const differs = Object.keys(priceData).some(key => key !== 'quantity' &&
          (numericKeys.has(key) ? Number(item[key] ?? 0) !== Number(priceData[key] ?? 0) : item[key] !== priceData[key]))
        if (!differs) return item
        changed = true
        return { ...item, ...priceData, quantity: item.quantity }
        })
        return changed ? updated : current
      })
      return data
    } catch (error) {
      console.error('Could not refresh cart prices:', error)
      return null
    }
  }, [cartItems])

  useEffect(() => {
    if (!cartLoaded || !cartItems.length) return undefined
    refreshCartPrices()
    const timer = setInterval(refreshCartPrices, 15000)
    return () => clearInterval(timer)
  }, [cartLoaded, cartItems.length, refreshCartPrices])

  const addToCart = (product, quantity = 1) => {
    // Store the price currently advertised by the server-enriched product.
    const cartProduct = { ...product, price: Number(product.current_price ?? product.price) }
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...cartProduct, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevItems, { ...cartProduct, quantity }]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        refreshCartPrices,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

