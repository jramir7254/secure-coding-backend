const jswt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwt } = require('@config/index');

function signToken(claims) {

    const token = jswt.sign({ ...claims }, jwt.secret, {
        expiresIn: '30days'
    });

    console.debug('tokens.sign', { claims, token })

    return token;
}



function authMiddleware(req, res, next) {
    console.info("using.auth_middleware")
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.error('Missing token');
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jswt.verify(token, jwt.secret);
        req.user = decoded; // attach user info (id, email, etc.)
        console.debug('decoded.user', { decoded })

        next();
    } catch (err) {
        console.error('❌ Invalid token:', err.message);
        res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    }
}


function requireAdmin(req, res, next) {
    console.info("using.require_admin")

    if (!req.user) {
        console.error('Missing user');
        return res.status(401).json({ success: false, error: 'Access denied. No user provided.' });
    }

    try {
        if (!(req.user?.isAdmin)) {
            console.error("not_admin")
            return res.status(403).json({ success: false, message: 'Unauthorized action!' });
        }
        console.info("is_admin")
        next();
    } catch (err) {
        console.error('User not an admin:', err.message);
        res.status(403).json({ success: false, message: 'Unauthorized action!' });
    }
}


module.exports = { signToken, authMiddleware, requireAdmin }