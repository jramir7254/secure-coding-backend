const jswt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwt } = require('@config/index');
const logger = require('./logger');

function signToken(claims) {

    const token = jswt.sign({ ...claims }, jwt.secret, {
        expiresIn: '30days'
    });

    console.debug('token.signed', { claims, token })
    return token;
}



function authMiddleware(req, res, next) {
    logger.info("using.auth_middleware")
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        logger.error('token.missing');
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jswt.verify(token, jwt.secret);
        req.team = decoded; // attach user info (id, email, etc.)
        logger.debug('decoded.user', { decoded })

        next();
    } catch (err) {
        logger.error('token.invalid', err.message);
        res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    }
}


function requireAdmin(req, res, next) {
    logger.info("using.require_admin")

    if (!req.team) {
        logger.error('team.missing');
        return res.status(401).json({ success: false, error: 'Access denied. No user provided.' });
    }

    try {
        if (!(req.team?.isAdmin)) {

            return res.status(403).json({ success: false, message: 'Unauthorized action!' });
        }
        next();
    } catch (err) {
        logger.error("team.unauthorized")
        res.status(403).json({ success: false, message: 'Unauthorized action!' });
    }
}


module.exports = { signToken, authMiddleware, requireAdmin }