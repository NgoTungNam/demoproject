const crypto = require('crypto');
const qs = require('qs');

function sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[decodeURIComponent(str[key])]).replace(/%20/g, "+");
    }
    return sorted;
}

function createVnpayPayment(amount, orderInfo, ipAddr, orderId) {
    const tmnCode = process.env.VNP_TMNCODE;
    const hashSecret = process.env.VNP_HASH_SECRET;
    if (!tmnCode || !hashSecret) throw new Error('VNPay payment credentials are not configured.');
    const vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/payment/vnpay/return`;

    const date = new Date();
    const createDate = formatDate(date);
    const vnpTxnRef = orderId ? `${orderId}_${Date.now()}` : formatDate(date, true);

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = vnpTxnRef;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr || '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;
    const finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

    return { paymentUrl: finalUrl };
}

function verifyVnpayCallback(query) {
    if (!process.env.VNP_TMNCODE || !process.env.VNP_HASH_SECRET) return false;
    const secureHash = query['vnp_SecureHash'];
    const params = { ...query };
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = sortObject(params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hashSecret = process.env.VNP_HASH_SECRET;
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const received = Buffer.from(String(secureHash || ''), 'hex');
    const expected = Buffer.from(signed, 'hex');
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function formatDate(date, withMs = false) {
    const pad = (n) => n.toString().padStart(2, '0');
    let res = date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
    if (withMs) res += date.getMilliseconds();
    return res;
}

module.exports = { createVnpayPayment, verifyVnpayCallback };
