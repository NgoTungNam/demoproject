const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

// ============================================================
// MOMO PAYMENT SANDBOX CONFIG
// ============================================================
const MOMO_CONFIG = {
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
    secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/checkout/payment-result`,
    ipnUrl: `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/payment/momo/ipn`,
    requestType: 'payWithMethod',
};

// ============================================================
// VNPAY PAYMENT SANDBOX CONFIG
// ============================================================
const VNPAY_CONFIG = {
    tmnCode: process.env.VNP_TMNCODE || 'DEMOVNPA',
    hashSecret: process.env.VNP_HASH_SECRET || 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZTS',
    url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/checkout/payment-result`,
    version: '2.1.0',
    command: 'pay',
    currCode: 'VND',
    locale: 'vn',
};

// ============================================================
// MOMO: Create payment URL
// ============================================================
function createMomoPaymentUrl(orderId, amount, orderInfo) {
    const requestId = `${Date.now()}_${orderId}`;
    const extraData = '';
    const autoCapture = true;
    const lang = 'vi';

    const rawSignature =
        `accessKey=${MOMO_CONFIG.accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData}` +
        `&ipnUrl=${MOMO_CONFIG.ipnUrl}` +
        `&orderId=${requestId}` +
        `&orderInfo=${orderInfo}` +
        `&partnerCode=${MOMO_CONFIG.partnerCode}` +
        `&redirectUrl=${MOMO_CONFIG.redirectUrl}` +
        `&requestId=${requestId}` +
        `&requestType=${MOMO_CONFIG.requestType}`;

    const signature = crypto
        .createHmac('sha256', MOMO_CONFIG.secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = {
        partnerCode: MOMO_CONFIG.partnerCode,
        accessKey: MOMO_CONFIG.accessKey,
        requestId,
        amount: String(amount),
        orderId: requestId,
        orderInfo,
        redirectUrl: MOMO_CONFIG.redirectUrl,
        ipnUrl: MOMO_CONFIG.ipnUrl,
        extraData,
        requestType: MOMO_CONFIG.requestType,
        signature,
        lang,
        autoCapture,
    };

    return new Promise((resolve, reject) => {
        const bodyStr = JSON.stringify(requestBody);
        const url = new URL(MOMO_CONFIG.endpoint);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
            },
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(bodyStr);
        req.end();
    });
}

// ============================================================
// MOMO: Verify IPN callback
// ============================================================
function verifyMomoCallback(body) {
    const {
        partnerCode, orderId, requestId, amount, orderInfo,
        orderType, transId, resultCode, message, payType,
        responseTime, extraData, signature,
    } = body;

    const rawSignature =
        `accessKey=${MOMO_CONFIG.accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData}` +
        `&message=${message}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo}` +
        `&orderType=${orderType}` +
        `&partnerCode=${partnerCode}` +
        `&payType=${payType}` +
        `&requestId=${requestId}` +
        `&responseTime=${responseTime}` +
        `&resultCode=${resultCode}` +
        `&transId=${transId}`;

    const expectedSignature = crypto
        .createHmac('sha256', MOMO_CONFIG.secretKey)
        .update(rawSignature)
        .digest('hex');

    return signature === expectedSignature;
}

// ============================================================
// VNPAY: Create payment URL
// ============================================================
function createVnpayPaymentUrl(orderId, amount, orderDesc, ipAddr) {
    const date = new Date();
    const createDate = formatDate(date);
    const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000));

    let vnpParams = {
        vnp_Version: VNPAY_CONFIG.version,
        vnp_Command: VNPAY_CONFIG.command,
        vnp_TmnCode: VNPAY_CONFIG.tmnCode,
        vnp_Locale: VNPAY_CONFIG.locale,
        vnp_CurrCode: VNPAY_CONFIG.currCode,
        vnp_TxnRef: `${orderId}_${Date.now()}`,
        vnp_OrderInfo: orderDesc,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100, // VNPay expects amount * 100
        vnp_ReturnUrl: VNPAY_CONFIG.returnUrl,
        vnp_IpAddr: ipAddr || '127.0.0.1',
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    };

    vnpParams = sortObject(vnpParams);

    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams.vnp_SecureHash = signed;

    const paymentUrl =
        VNPAY_CONFIG.url + '?' + querystring.stringify(vnpParams, { encode: false });

    return paymentUrl;
}

// ============================================================
// VNPAY: Verify return/IPN signature
// ============================================================
function verifyVnpayCallback(query) {
    const secureHash = query['vnp_SecureHash'];
    const params = { ...query };
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = sortObject(params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return signed === secureHash;
}

// ============================================================
// Helpers
// ============================================================
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => (sorted[key] = obj[key]));
    return sorted;
}

function formatDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return (
        date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
}

module.exports = {
    createMomoPaymentUrl,
    verifyMomoCallback,
    createVnpayPaymentUrl,
    verifyVnpayCallback,
};
