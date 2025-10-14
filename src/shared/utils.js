const crypto = require('crypto')

function generateAccessCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    const randomValues = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
        code += chars[randomValues[i] % chars.length];
    }
    return code;
}

function _snakeToCamel(str) {
    return str.replace(/(_\w)/g, (match) => {
        return match[1].toUpperCase();
    });
}

function snakeToCamel(param) {
    if (param === null) return
    if (Array.isArray(param)) return param.map(obj => snakeToCamel(obj))
    if (typeof param === 'object') return Object.keys(param).reduce((acc, key) => {
        const newKey = _snakeToCamel(key); // Use new key if mapped, otherwise keep original
        acc[newKey] = param[key];
        return acc;
    }, {});
    if (typeof param === 'string') return _snakeToCamel(param)
}


module.exports = { generateAccessCode, snakeToCamel }