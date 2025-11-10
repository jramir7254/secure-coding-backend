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

    if (onSection === 'exploit') {
        throw new ExpectedAppError('Team finished');
    }

    let newSection;
    if (onSection === 'mcq') newSection = 'coding';
    else if (onSection === 'coding') newSection = 'exploit';

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
      ORDER BY RANDOM()
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






function areArraysEqual(arr1, arr2) {
    // First, check if they are the same reference (primitive equality)
    if (arr1 === arr2) {
        return true;
    }

    // If either is null or undefined, they are not equal (unless both are)
    if (arr1 == null || arr2 == null) {
        return false;
    }

    // Check if lengths are different
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Iterate and compare each element
    for (let i = 0; i < arr1.length; i++) {
        // For deep comparison of objects within arrays, you might need recursion
        // or a specialized deep comparison library. This example assumes
        // primitive values or objects that can be compared with strict equality.
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}


async function handleMultipleChoiceAttempt({ teamId, attemptId, questionId, selectedAnswer }) {

    const db = await connect();
    // await db.run('INSERT INTO ceq_attempts (attempt_id, selected_answer) VALUES (?,?)', [attemptId, selectedAnswer])
    const an = await db.get('SELECT * FROM mcq_answers WHERE question_id = ?', [questionId])

    logger.debug('answers', { answers: JSON.parse(an?.answers), selectedAnswer })

    const correct = areArraysEqual(JSON.parse(an?.answers), selectedAnswer)

    logger.debug('correct', { correct })


    if (!correct) {
        logger.warn('Wrong answer')

        throw new Error("Wrong answer")
    }

    logger.success('Correct, closing attempt')
    await db.run("UPDATE question_attempts SET completed_at = datetime('now', 'localtime') WHERE id = ?", [attemptId])
    logger.info('Attempt closed')

    const count = await db.get('SELECT COUNT (*) FROM mcq_attempts WHERE attempt_id = ?', [attemptId])
    logger.debug('Count', { count: count['COUNT (*)'] })

    const score = 100 - count['COUNT (*)']

    logger.debug('Score', { score })
    await db.run(`
  INSERT INTO leaderboard (team_id, total_points)
  VALUES (?, ?)
  ON CONFLICT(team_id)
  DO UPDATE SET total_points = leaderboard.total_points + excluded.total_points
`, [teamId, score]);

    const { teamName } = await db.get('SELECT team_name AS teamName FROM teams WHERE id = ?', [teamId])
    logger.debug('teamName', { teamName })

    const io = getIO()
    io.emit("leaderboard_updated", { teamId, score, teamName });


    logger.info('Rotating question type')
    // const { lastID } = await db.run("INSERT INTO question_attempts (team_id, question_id, type) VALUES (?,?,'coding')", [teamId, questionId])

    // return { attemptId: lastID, score }

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
    await db.run("UPDATE question_attempts SET completed_at = datetime('now', 'localtime') WHERE id = ?", [attemptId])
    logger.info('Attempt closed')

    const count = await db.get('SELECT COUNT (*) FROM coding_attempts WHERE attempt_id = ?', [attemptId])
    logger.debug('Count', { count: count['COUNT (*)'] })

    const score = 100 - count['COUNT (*)']

    logger.debug('Score', { score })
    await db.run('INSERT INTO leaderboard (team_id, attempt_id, total_points) VALUES (?,?,total_points+?)', [teamId, attemptId, score])

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





module.exports = { getQuestion, handleMultipleChoiceAttempt, handleCodingAttempt, getAllQuestions }