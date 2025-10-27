const { connect } = require('@config/db/dev/database.dev')
const logger = require('@shared/logger')
const { judge0Api, pistonApi } = require('@config/judge0')
const { IncorrectAttemptError, ResourceNotFoundError } = require('@shared/errors')
const { getIO } = require('@src/modules/socket')


async function getQuestion(teamId) {
    const db = await connect();

    const qa = await db.get('SELECT * FROM question_attempts WHERE team_id = ? AND ended_at IS NULL', [teamId]);

    if (qa) {

        logger.info('Returning existing attempt')
        const qc = await db.get('SELECT id, code, editable_ranges FROM questions WHERE id = ?', [qa.question_id])
        return { attemptId: qa?.id, question: qc, questionType: qa?.type, startedAt: qa.started_at }
    }
    const nq = await db.get(`
        SELECT q.*
        FROM questions q
        WHERE q.id NOT IN (
            SELECT question_id
            FROM question_attempts
            WHERE team_id = ?
            GROUP BY question_id
            HAVING COUNT(DISTINCT type) = 2
        )
        ORDER BY RANDOM()
        LIMIT 1;
    `, [teamId]);


    if (!nq) { throw new Error('Team finished') }
    console.info('Returning new attempt')

    const { lastID } = await db.run("INSERT INTO question_attempts (team_id, question_id, type) VALUES (?,?,'multiple')", [teamId, nq.id])

    return { attemptId: lastID, question: nq, questionType: 'multiple' }
}



async function handleAttempt() {
    const db = await connect();

}

async function handleMultipleChoiceAttempt({ teamId, attemptId, questionId, selectedAnswer }) {
    const db = await connect();
    await db.run('INSERT INTO multiple_choice_attempts (attempt_id, selected_answer) VALUES (?,?)', [attemptId, selectedAnswer])
    const correct = await db.get('SELECT * FROM questions WHERE id = ? AND answer = ?', [questionId, selectedAnswer])

    if (!correct) {
        logger.warn('Wrong answer')

        throw new Error("Wrong answer")
    }

    logger.success('Correct, closing attempt')
    await db.run("UPDATE question_attempts SET ended_at = datetime('now', 'localtime') WHERE id = ?", [attemptId])
    logger.info('Attempt closed')

    const count = await db.get('SELECT COUNT (*) FROM multiple_choice_attempts WHERE attempt_id = ?', [attemptId])
    logger.debug('Count', { count: count['COUNT (*)'] })

    const score = 100 - count['COUNT (*)']

    logger.debug('Score', { score })
    await db.run('INSERT INTO leaderboard (team_id, attempt_id, points) VALUES (?,?,?)', [teamId, attemptId, score])


    const { teamName } = await db.get('SELECT team_name AS teamName FROM teams WHERE id = ?', [teamId])
    logger.debug('teamName', { teamName })

    const io = getIO()
    io.emit("leaderboard_updated", { teamId, score, teamName });


    logger.info('Rotating question type')
    const { lastID } = await db.run("INSERT INTO question_attempts (team_id, question_id, type) VALUES (?,?,'coding')", [teamId, questionId])

    return { attemptId: lastID, score }

}

async function handleCodingAttempt({ teamId, attemptId, questionId, submittedCode }) {
    const db = await connect();
    await db.run('INSERT INTO coding_attempts (attempt_id, submitted_code) VALUES (?,?)', [attemptId, submittedCode])


    const { data } = await pistonApi.post('', {
        "language": "java",
        "version": "15.0.2",
        "files": [
            {
                "name": "Main.java",
                "content": submittedCode
            }
        ],
        "stdin": "",
        "args": []
    })

    let { output } = data?.run

    output = output.replace(/^"+|"+$/g, "").trim().replace(/^\s+/gm, "");


    logger.debug('Output', { output })

    const { expected_output } = await db.get('SELECT expected_output FROM questions WHERE id = ?', [questionId])
    if (expected_output !== output) {
        logger.warn('Wrong answer output', { expected: expected_output, actual: output })

        throw new IncorrectAttemptError(output)
    } else {
        logger.success('Correct answer output', { expected: expected_output, actual: output })

    }


    // return { output }



    logger.success('Correct, closing attempt')
    await db.run("UPDATE question_attempts SET ended_at = datetime('now', 'localtime') WHERE id = ?", [attemptId])
    logger.info('Attempt closed')

    const count = await db.get('SELECT COUNT (*) FROM coding_attempts WHERE attempt_id = ?', [attemptId])
    logger.debug('Count', { count: count['COUNT (*)'] })

    const score = 100 - count['COUNT (*)']

    logger.debug('Score', { score })
    await db.run('INSERT INTO leaderboard (team_id, attempt_id, points) VALUES (?,?,?)', [teamId, attemptId, score])

    const { teamName } = await db.get('SELECT team_name FROM teams WHERE id = ?', [teamId])

    logger.debug('teamName', { teamName })

    const io = getIO()
    io.emit("leaderboard_updated", { teamId, score, teamName });

    logger.info('Rotating question')
    const { attemptId: newAttemptId, question, questionType } = await getQuestion(teamId)

    return { attemptId: newAttemptId, question, questionType, output, score }

}



async function getAllQuestions() {
    const db = await connect();
    const allQuestions = await db.all('SELECT * FROM questions')
    return allQuestions

}





module.exports = { handleAttempt, getQuestion, handleMultipleChoiceAttempt, handleCodingAttempt, getAllQuestions }