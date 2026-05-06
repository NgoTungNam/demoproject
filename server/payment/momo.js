const crypto = require('crypto');
const axios = require('axios');

async function createMomoPayment(amount, orderInfo, orderId) {
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
    const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';
    
    // MoMo requires orderId to be unique for each request. 
    // We use the database orderId + timestamp to keep it unique while trackable.
    const momoOrderId = orderId ? `${orderId}_${Date.now()}` : partnerCode + new Date().getTime();
    const requestId = momoOrderId;
    const redirectUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/checkout/payment-result`;
    const ipnUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/payment/momo/ipn`;
    const requestType = "payWithMethod";
    const extraData = ""; // optional

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = {
        partnerCode,
        partnerName: "EuroAsia Kitchen",
        storeId: "EuroAsia_Store",
        requestId,
        amount: String(amount), // Ensure amount is a string
        orderId: momoOrderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang: 'vi',
        requestType,
        autoCapture: true,
        extraData,
        signature
    };

    try {
        console.log('[MoMo Request]', requestBody);
        const response = await axios.post(endpoint, requestBody);
        console.log('[MoMo Response]', response.data);
        
        if (response.data.resultCode !== 0) {
            throw new Error(`MoMo error: ${response.data.message} (code: ${response.data.resultCode})`);
        }
        
        return response.data; // contains payUrl
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error('MoMo Error Detail:', errorData);
        throw new Error(typeof errorData === 'object' ? JSON.stringify(errorData) : errorData);
    }
}

module.exports = { createMomoPayment };
