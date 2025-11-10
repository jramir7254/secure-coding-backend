const { Router } = require('express');
const logger = require('@shared/logger')

const routes = Router();

const { getQuestion, getAllQuestions } = require('./questions.module');
const { authMiddleware, requireAdmin } = require('@shared/auth');
const { snakeToCamel } = require('@shared/utils');
const { handleAttempt } = require('./attempts.module');


routes.get('/current', authMiddleware, async (req, res) => {
    const { id, onSection } = req?.team
    logger.info('questions.get.current', { teamId: id });
    const { attemptData, questionData } = await getQuestion(id, onSection);
    return res.json(snakeToCamel({ attemptData, questionData }));
});



routes.get('/list', authMiddleware, async (req, res) => {
    const all = await getAllQuestions();
    return res.json(snakeToCamel(all))
});



routes.post('/attempt', authMiddleware, async (req, res) => {
    const { id } = req?.team
    const { attemptData, questionData } = req.body
    logger.debug('questions.attempt', { teamId: id, attemptData });

    const { id: questionId } = questionData
    const { id: attemptId } = attemptData

    if (questionData?.type === 'mcq') {
        logger.info('questions.attempt.mcq');
        const { submittedAnswers } = req.body
        const { attemptData, questionData, score } = await handleAttempt({ teamId: id, questionId, attemptId, submissionData: { submissionType: 'mcq', submittedAnswers } })
        return res.status(200).json(snakeToCamel({ attemptData, questionData, score }))
    }

    if (questionData?.type === 'coding') {
        logger.info('questions.attempt.coding');
        const { submittedCode } = req.body
        const { attemptData, questionData, score, output } = await handleAttempt({ teamId: id, questionId, attemptId, submissionData: { submissionType: 'coding', submittedCode } })
        return res.status(200).json(snakeToCamel({ attemptData, questionData, score, output }))
    }

});



module.exports = routes;
