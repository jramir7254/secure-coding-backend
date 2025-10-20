const { Router } = require('express');
const routes = Router();

const { getCurrentGame, getPastGames, createGame, getLeaderboard, endCurrentGame } = require('./games.module');
const { authMiddleware, requireAdmin } = require('@shared/auth');
const { snakeToCamel } = require('@shared/utils');


routes.get('/current', authMiddleware, async (req, res) => {
    const currentGame = await getCurrentGame();
    return res.json(snakeToCamel(currentGame));
});


routes.get('/past', authMiddleware, async (req, res) => {
    const pastGames = await getPastGames();
    return res.json(snakeToCamel(pastGames));
});


routes.get('/leaderboard', authMiddleware, async (req, res) => {
    const l = await getLeaderboard();
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



module.exports = routes;
