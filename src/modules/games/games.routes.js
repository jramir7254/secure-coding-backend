const { Router } = require('express');
const routes = Router();

const {
    getCurrentGame,
    getPastGames,
    createGame,
    getLeaderboard,
    endCurrentGame,
    closeCurrentGame,
    getTeamsInCurrentGame,
    getTopTeamsFromAllGames,
    getTeamResults
} = require('./games.module');


const { authMiddleware, requireAdmin } = require('@shared/auth');
const { snakeToCamel } = require('@shared/utils');
const logger = require('@shared/logger');


routes.get('/current', authMiddleware, async (req, res) => {
    logger.info('games.current')

    const currentGame = await getCurrentGame();
    return res.json(snakeToCamel(currentGame));
});


// routes.get('/:gameId', authMiddleware, async (req, res) => {
//     logger.info('games.id')

//     const currentGame = await getCurrentGame();
//     return res.json(snakeToCamel(currentGame));
// });


routes.get('/teams/:teamId/results', authMiddleware, async (req, res) => {
    logger.info('games.teams.results')

    const { teamId } = req.params
    const results = await getTeamResults(teamId);
    return res.json(snakeToCamel(results));
});


routes.get('/:gameId/results', authMiddleware, async (req, res) => {
    logger.info('games.results')

    const currentGame = await getCurrentGame();
    return res.json(snakeToCamel(currentGame));
});


routes.get('/current/teams', authMiddleware, async (req, res) => {
    logger.info('games.current.teams')

    const teams = await getTeamsInCurrentGame();
    return res.json(snakeToCamel(teams));
});


routes.get('/past', authMiddleware, async (req, res) => {
    logger.info('games.past')
    const pastGames = await getPastGames();
    logger.success('games.past')

    return res.json(snakeToCamel(pastGames));
});


routes.get('/current/leaderboard', authMiddleware, async (req, res) => {
    const l = await getLeaderboard();
    return res.json(snakeToCamel(l));
});


routes.get('/all/leaderboard', authMiddleware, async (req, res) => {
    const l = await getTopTeamsFromAllGames();
    return res.json(snakeToCamel(l));
});


routes.post('/create', authMiddleware, requireAdmin, async (req, res) => {
    await createGame(req.body);
    const currentGame = await getCurrentGame();

    return res.json(snakeToCamel(currentGame));
})


routes.post('/end', authMiddleware, requireAdmin, async (req, res) => {
    await endCurrentGame();

    return res.status(200)
});

/**
 * use sentStatus instead of status to close request
 */
routes.post('/close', authMiddleware, requireAdmin, async (req, res) => {
    logger.info('closing game')
    await closeCurrentGame();
    logger.info('returning')

    return res.sendStatus(200)
});



module.exports = routes;
