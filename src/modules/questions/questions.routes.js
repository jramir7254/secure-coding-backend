const { Router } = require('express');

const routes = Router();

const { getQuestion } = require('./questions.module');
const { authMiddleware, requireAdmin } = require('@shared/auth');
const { snakeToCamel } = require('@shared/utils');


routes.get('/', authMiddleware, async (req, res) => {
    const question = await getQuestion();
    console.debug('question', { id: question.id });
    return res.json(snakeToCamel(question));
});



module.exports = routes;
