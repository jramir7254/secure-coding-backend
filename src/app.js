const express = require('express')
const cors = require('cors')
const { getQuestion } = require('./modules/game.module')
const { resetDb } = require('./modules/admin.module')
const { register, login } = require('./modules/auth.module')
const { authMiddleware, requireAdmin } = require('@shared/auth')


const app = express()
app.use(cors())
app.use(express.json());



app.get('/', async (req, res) => {
    console.log('call made')
    return res.status(200).json({})
})



app.get('/question', async (req, res) => {
    const question = await getQuestion()
    console.debug('question', { id: question.id })
    return res.json(question);
});


app.post('/admin/reset', authMiddleware, requireAdmin, async (req, res) => {
    await resetDb()
    return res.status(200).json({ success: true, message: "Database successfully reset" });
});


app.post('/auth/register', async (req, res) => {
    console.debug('auth.register', req.body)
    const accessToken = await register(req.body)
    return res.status(200).json(accessToken);
});


app.post('/auth/login', async (req, res) => {
    console.debug('auth.login', req.body)
    const accessToken = await login(req.body)
    return res.status(200).json(accessToken);
});



app.use((err, req, res, next) => {
    console.error('🔥 Error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, error: message });
});


module.exports = app