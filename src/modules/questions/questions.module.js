const { connect } = require('@config/db/dev/database.dev')
const database = require('@config/db/database')
const logger = require('@shared/logger')
const { judge0Api, pistonApi } = require('@config/judge0')
const { IncorrectAttemptError, ExpectedAppError } = require('@shared/errors')
const { getIO } = require('@src/modules/socket')





/**
 * Get or create a question attempt for a team
 */
async function getQuestion(teamId, onSection) {

    const db = await connect();

    // Check for an ongoing attempt
    const existingAttempt = await db.get(
        'SELECT * FROM question_attempts WHERE team_id = ? AND completed_at IS NULL',
        [teamId]
    );

    if (existingAttempt) {
        logger.info('Returning existing attempt');
        const currentQuestion = await getQuestionById(existingAttempt.question_id);
        return { attemptData: existingAttempt, questionData: currentQuestion };
    }

    // Get a new question
    const newQuestion = await getRandomUnattemptedQuestion(teamId, onSection);
    if (!newQuestion) throw new ExpectedAppError('Team finished');

    logger.info('Returning new attempt');

    const { lastID } = await db.run(
        'INSERT INTO question_attempts (team_id, question_id) VALUES (?, ?)',
        [teamId, newQuestion.id]
    );

    const newAttempt = await db.get(
        'SELECT * FROM question_attempts WHERE id = ?',
        [lastID]
    );

    return { attemptData: newAttempt, questionData: newQuestion };
}






















/**
 * Switch a team to the next section
 */
async function switchTeamSection(teamId, onSection) {
    logger.debug('section.rotation', { teamId, onSection });

    const db = await connect();

    if (onSection === 'coding') {
        throw new ExpectedAppError('Team finished');
    }

    let newSection;
    if (onSection === 'mcq') newSection = 'coding';

    logger.info('section.rotation', { currSection: onSection, newSection });

    await db.run('UPDATE teams SET on_section = ? WHERE id = ?', [
        newSection,
        teamId,
    ]);

    return newSection;
}













/**
 * Fetch a question and its related code files
 */
async function getQuestionById(questionId) {
    const db = await connect();
    logger.info('question.by.id', { questionId });

    try {
        const question = await db.get(
            `
      SELECT 
        q.*, 
        json_group_array(
          json_object(
            'id', cf.id,
            'name', cf.name,
            'language', cf.language,
            'value', cf.value,
            'displayOrder', cf.display_order,
            'editableRanges', cf.editable_ranges
          )
        ) AS codeFiles
      FROM questions q
      LEFT JOIN code_files cf ON q.id = cf.question_id
      WHERE q.id = ?
      GROUP BY q.id;
      `,
            [questionId]
        );

        if (!question) {
            throw new ExpectedAppError(`Question not found (id=${questionId})`);
        }

        logger.debug('question.by.id.result', { questionId, hasFiles: !!question.codeFiles });
        return question;
    } catch (error) {
        logger.error('Failed to get question by id', { questionId, error });
        throw error;
    }
}












/**
 * Get a random question that hasn't been attempted by a team
 * Recursively moves sections until a valid question is found or team finishes
 */
async function getRandomUnattemptedQuestion(teamId, onSection) {
    const db = await connect();
    logger.info('question.random', { teamId, onSection });

    try {
        const question = await db.get(
            `
      SELECT 
        q.*, 
        json_group_array(
          json_object(
            'id', cf.id,
            'name', cf.name,
            'language', cf.language,
            'value', cf.value,
            'displayOrder', cf.display_order
          )
        ) AS codeFiles
      FROM questions q
      LEFT JOIN code_files cf ON q.id = cf.question_id
      WHERE q.id NOT IN (
        SELECT question_id
        FROM question_attempts
        WHERE team_id = ?
      )
      AND q.type = ?
      GROUP BY q.id
      ORDER BY q.id
      LIMIT 1;
      `,
            [teamId, onSection]
        );

        if (!question) {
            logger.info('No unattempted question found', { teamId, onSection });
            const newSection = await switchTeamSection(teamId, onSection);
            logger.info('Retrying random question in new section', {
                teamId,
                newSection,
            });
            return await getRandomUnattemptedQuestion(teamId, newSection);
        }

        logger.debug('question.random.result', { questionId: question.id });
        return question;
    } catch (error) {
        if (error instanceof ExpectedAppError) throw error;
        logger.error('Error in getRandomUnattemptedQuestion', {
            teamId,
            onSection,
            error,
        });
        throw error;
    }
}

























async function getAllQuestions() {
    const db = await connect();
    const allQuestions = await db.all('SELECT * FROM questions')
    return allQuestions
}





module.exports = { getQuestion, getAllQuestions }