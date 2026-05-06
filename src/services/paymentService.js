import axios from 'axios'
import { API_BASE_URL } from './api'

const API_BASE = `${API_BASE_URL}/api/payment`

export const paymentService = {
  /**
   * Tạo URL thanh toán MoMo rồi redirect
   */
  async payWithMomo(orderId, amount, orderInfo) {
    console.log('[paymentService] payWithMomo:', { orderId, amount });
    const { data } = await axios.post(`${API_BASE}/momo/create`, {
      orderId,
      amount,
      orderInfo,
    })
    if (data.success && data.payUrl) {
      window.location.href = data.payUrl
    } else {
      throw new Error(data.error || data.message || 'Không thể tạo thanh toán MoMo')
    }
  },

  /**
   * Tạo URL thanh toán VNPay rồi redirect
   */
  async payWithVnpay(orderId, amount, orderInfo) {
    console.log('[paymentService] payWithVnpay:', { orderId, amount });
    const { data } = await axios.post(`${API_BASE}/vnpay/create`, {
      orderId,
      amount,
      orderInfo,
    })
    if (data.success && data.paymentUrl) {
      window.location.href = data.paymentUrl
    } else {
      throw new Error(data.error || data.message || 'Không thể tạo thanh toán VNPay')
    }
  },

  /**
   * Xác nhận đơn hàng COD
   */
  async confirmCod(orderId) {
    const { data } = await axios.post(`${API_BASE}/cod/confirm`, { orderId })
    return data
  },
}
