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
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function snakeToCamel(param) {
    if (param === null || param === undefined) return param;

    if (Array.isArray(param)) {
        return param.map(snakeToCamel);
    }

    if (typeof param === 'object' && param.constructor === Object) {
        return Object.keys(param).reduce((acc, key) => {
            const newKey = _snakeToCamel(key);
            acc[newKey] = snakeToCamel(param[key]);
            return acc;
        }, {});
    }

    if (typeof param === 'string') {
        return _snakeToCamel(param);
    }

    return param;
}


function areArraysEqual(arr1, arr2) {
    // First, check if they are the same reference (primitive equality)
    if (arr1 === arr2) {
        return true;
    }

    // If either is null or undefined, they are not equal (unless both are)
    if (arr1 == null || arr2 == null) {
        return false;
    }

    // Check if lengths are different
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Iterate and compare each element
    for (let i = 0; i < arr1.length; i++) {
        // For deep comparison of objects within arrays, you might need recursion
        // or a specialized deep comparison library. This example assumes
        // primitive values or objects that can be compared with strict equality.
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}



module.exports = { generateAccessCode, snakeToCamel, areArraysEqual }