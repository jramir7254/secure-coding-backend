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



module.exports = { generateAccessCode }