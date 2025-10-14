const { Router } = require('express');

const routes = Router();

const { getCurrentGame, getPastGames, createGame } = require('./games.modules');
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


routes.post('/create', authMiddleware, requireAdmin, async (req, res) => {
    await createGame(req.body);
    const currentGame = await getCurrentGame();

    return res.json(snakeToCamel(currentGame));
});



module.exports = routes;
