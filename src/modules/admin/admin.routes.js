const { Router } = require('express');


const { resetDb } = require('./admin.module');
const { authMiddleware, requireAdmin } = require('@shared/auth');

const routes = Router();



routes.post('/reset', authMiddleware, requireAdmin, async (req, res) => {
    await resetDb();
    return res.status(200).json({
        success: true,
        message: 'Database successfully reset',
    });
});


// --- Export or Start ---


module.exports = routes;
