const { Router } = require('express');
const logger = require('@shared/logger')

const routes = Router();

const { getQuestion, handleMultipleChoiceAttempt, handleCodingAttempt } = require('./questions.module');
const { authMiddleware, requireAdmin } = require('@shared/auth');
const { snakeToCamel } = require('@shared/utils');


routes.get('/current', authMiddleware, async (req, res) => {
    const { id } = req?.team
    console.debug('get-question', { teamId: id });

    const { attemptId, question, questionType, startedAt } = await getQuestion(id);
    console.debug('question', { attemptId, question, questionId: question?.id, questionType, startedAt });
    return res.json(snakeToCamel({ attemptId, question, questionType, startedAt }));
});


routes.post('/attempt', authMiddleware, async (req, res) => {
    const { id } = req?.team
    const { attemptId, questionId, questionType } = req.body
    logger.debug('attempt-question', { teamId: id, attemptId, questionId, questionType });

    if (questionType === 'multiple') {
        console.debug('attempt-question-multiple');
        const { selectedAnswer } = req.body
        const { attemptId: newAttemptId, score } = await handleMultipleChoiceAttempt({ teamId: id, questionId, attemptId, selectedAnswer })
        return res.json(snakeToCamel({ attemptId: newAttemptId, questionType: 'coding', score }));
    }
    if (questionType === 'coding') {
        console.debug('attempt-question-coding');
        const { submittedCode } = req.body
        const { output, attemptId: newAttemptId, question, questionType } = await handleCodingAttempt({ teamId: id, questionId, attemptId, submittedCode })
        return res.json(snakeToCamel({ output, attemptId: newAttemptId, question, questionType }));

    }
});



module.exports = routes;
