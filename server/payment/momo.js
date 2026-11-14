const crypto = require('crypto');
const axios = require('axios');

const DEFAULT_PARTNER_CODE = 'MOMO';
const DEFAULT_ACCESS_KEY = 'F8BBA842ECF85';
const DEFAULT_SECRET_KEY = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const DEFAULT_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create';

async function createMomoPayment(amount, orderInfo, orderId) {
    const partnerCode = process.env.MOMO_PARTNER_CODE || DEFAULT_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY || DEFAULT_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY || DEFAULT_SECRET_KEY;
    const endpoint = process.env.MOMO_ENDPOINT || DEFAULT_ENDPOINT;
    
    // MoMo requires orderId to be unique for each request. 
    // We use the database orderId + timestamp to keep it unique while trackable.
    const momoOrderId = orderId ? `${orderId}_${Date.now()}` : `${partnerCode}_${Date.now()}`;
    const requestId = momoOrderId;
    const redirectUrl = `${process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000'}/checkout/payment-result?method=momo`;
    const ipnUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/payment/momo/ipn`;
    const requestType = "captureWallet";
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
        amount: String(amount),
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
        console.log('[MoMo Create Request] Gửi yêu cầu MoMo:', { orderId: momoOrderId, amount });
        const response = await axios.post(endpoint, requestBody);
        console.log('[MoMo Create Response] Kết quả:', { resultCode: response.data?.resultCode, message: response.data?.message });
        
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

function verifyMomoSignature(params) {
    const partnerCode = process.env.MOMO_PARTNER_CODE || DEFAULT_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY || DEFAULT_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY || DEFAULT_SECRET_KEY;
    const {
        orderId, requestId, amount, orderInfo,
        orderType, transId, resultCode, message, payType,
        responseTime, extraData, signature
    } = params;

    if (!signature) return false;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData || ''}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType || 'momo_wallet'}&partnerCode=${partnerCode}&payType=${payType || 'qr'}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expected = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    return expected.toLowerCase() === String(signature).toLowerCase();
}

module.exports = { createMomoPayment, verifyMomoSignature };
