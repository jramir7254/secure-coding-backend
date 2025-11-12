const { connect } = require('@config/db/dev/database.dev')
const database = require('@config/db/database')
const logger = require('@shared/logger')
const { judge0Api, pistonApi } = require('@config/judge0')
const { IncorrectAttemptError, ExpectedAppError } = require('@shared/errors')
const { getIO } = require('@src/modules/socket')
const { areArraysEqual } = require('@shared/utils')
const { getQuestion } = require('./questions.module')





async function handleAttempt({ teamId, attemptId, questionId, submissionData }) {


    if (submissionData?.submissionType === 'mcq') {
        const { submittedAnswers } = submissionData
        const { timeCompleted, count } = await handleMultipleChoiceAttempt({ teamId, attemptId, questionId, submittedAnswers })

        const score = await _updateLeaderboard(timeCompleted, count, teamId)
        const { questionData, attemptData } = await getQuestion(teamId, 'mcq')
        return { score, questionData, attemptData }
    }

    if (submissionData?.submissionType === 'coding') {
        const { submittedCode } = submissionData
        logger.debug('questions.attempts.coding.submitted', submittedCode)
        const { timeCompleted, count, output } = await handleCodingAttempt({ teamId, attemptId, questionId, submittedCode })

        const score = await _updateLeaderboard(timeCompleted, count, teamId)
        const { questionData, attemptData } = await getQuestion(teamId, 'coding')
        return { score, questionData, attemptData, output }
    }

}



async function handleMultipleChoiceAttempt({ teamId, attemptId, questionId, submittedAnswers }) {

    const db = await connect();
    await db.run('INSERT INTO mcq_attempts (attempt_id, submitted_answers) VALUES (?,?)', [attemptId, submittedAnswers])
    const questionAnswers = await db.get('SELECT * FROM mcq_answers WHERE question_id = ?', [questionId])

    logger.debug('questions.attempts.answers', { answers: JSON.parse(questionAnswers?.answers), submittedAnswers })

    const correct = areArraysEqual(JSON.parse(questionAnswers?.answers), submittedAnswers)

    if (!correct) {
        logger.warn('questions.attempts.wrong', { correct })
        throw new IncorrectAttemptError("Wrong answer")
    }

    logger.success('questions.attempts.correct', { correct })


    const timeCompleted = await _closeCurrentAttempt(attemptId)


    const count = await db.get('SELECT COUNT (*) FROM mcq_attempts WHERE attempt_id = ?', [attemptId])
    logger.info('questions.attempts.count', { count: count['COUNT (*)'] })

    return { timeCompleted, count: count['COUNT (*)'] }
}








async function _closeCurrentAttempt(attemptId) {
    const db = await connect();
    logger.info('questions.attempts.closing')
    await db.run("UPDATE question_attempts SET completed_at = datetime('now', 'localtime') WHERE id = ?", [attemptId])
    const { startedAt, completedAt } = await db.get('SELECT started_at AS startedAt, completed_at as completedAt FROM question_attempts WHERE id = ?', [attemptId])
    logger.info('questions.attempts.closed', { startedAt, completedAt })
    return { startedAt, completedAt }
}


async function _updateLeaderboard(timeCompleted, points, teamId) {
    const db = await connect();
    const score = 100 - points

    logger.info('questions.attempts.score', { score })
    await db.run(`
        INSERT INTO leaderboard (team_id, total_points)
        VALUES (?, ?)
        ON CONFLICT(team_id)
        DO UPDATE SET total_points = leaderboard.total_points + excluded.total_points
    `, [teamId, score]);

    const { teamName } = await db.get('SELECT team_name AS teamName FROM teams WHERE id = ?', [teamId])
    logger.info('questions.attempts.team', { teamName })

    const io = getIO()
    io.emit("leaderboard_updated", { teamId, score, teamName });

    return score

}













async function handleCodingAttempt({ teamId, attemptId, questionId, submittedCode }) {
    const db = await connect();
    await db.run('INSERT INTO coding_attempts (attempt_id, submitted_code) VALUES (?,?)', [attemptId, "submittedCode"])

    const nonJavaFiles = submittedCode.filter(f => !f.uri.endsWith('java'))

    logger.debug('nonJavaFiles', { nonJavaFiles })

    const files = [
        {
            name: 'Main',
            content: mergeJavaFiles(submittedCode)
        }
    ]



    nonJavaFiles.forEach(n => files.push({ name: n.uri.split('/').pop(), content: n.value }))

    logger.debug('files', { files })

    const { data } = await pistonApi.post('', {
        language: "java",
        version: "15.0.2",
        files,
        compile_timeout: 10000,
        run_timeout: 5000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
        stdin: "4\n5\n3"
        // Custom compile + run commands:
        // (compile all .java files and run ShoppingCart)
    });
    let { output } = data?.run

    // output = output.replace(/^"+|"+$/g, "").trim().replace(/^\s+/gm, "");


    logger.debug('Output', { output })

    const { expected_output } = await db.get('SELECT expected_output FROM coding_answers WHERE id = ?', [questionId])
    if (expected_output !== output) {
        logger.warn('Wrong answer output', { expected: expected_output, actual: output })

        throw new IncorrectAttemptError(output)
    } else {
        logger.success('Correct answer output', { expected: expected_output, actual: output })

    }


    const timeCompleted = await _closeCurrentAttempt(attemptId)


    const count = await db.get('SELECT COUNT (*) FROM mcq_attempts WHERE attempt_id = ?', [attemptId])
    logger.info('questions.attempts.count', { count: count['COUNT (*)'] })

    return { timeCompleted, count: count['COUNT (*)'], output }

}


function mergeJavaFiles(fileObjects) {
    const imports = new Set();
    const classContents = [];

    for (const { uri, value } of fileObjects) {
        if (!uri.endsWith('java')) continue
        let code = value.trim();

        // Collect imports
        const importMatches = code.match(/import\s+[\w.*]+;\s*/g);
        if (importMatches) {
            importMatches.forEach(i => imports.add(i.trim()));
            code = code.replace(/import\s+[\w.*]+;\s*/g, '');
        }

        // Remove package declarations
        code = code.replace(/package\s+[\w.]+;\s*/g, '');

        classContents.push({ uri, code });
    }

    // Detect the file with `public static void main`
    // classContents.sort((a, b) => {
    //     const aHasMain = /public\s+static\s+void\s+main\s*\(/.test(a.code);
    //     const bHasMain = /public\s+static\s+void\s+main\s*\(/.test(b.code);
    //     return aHasMain ? 1 : bHasMain ? -1 : 0; // push main class last
    // });

    // Combine everything
    const merged = `${Array.from(imports).join('\n')}\n\n` +
        classContents.map(f => `// ---- From ${f.uri} ----\n${f.code}`).join('\n\n');


    logger.pretty(merged)

    return merged.trim();
}



module.exports = { handleMultipleChoiceAttempt, handleCodingAttempt, handleAttempt }