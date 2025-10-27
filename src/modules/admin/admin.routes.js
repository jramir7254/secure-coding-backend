const { Router } = require('express');
const { snakeToCamel } = require('@shared/utils');


const { resetDb, getTeamsInCurrentGame, deleteTeam } = require('./admin.module');
const logger = require('@shared/logger');


const routes = Router();



routes.post('/reset', async (req, res) => {
    await resetDb();
    return res.status(200).json({
        success: true,
        message: 'Database successfully reset',
    });
});

routes.get('/teams', async (req, res) => {
    const teams = await getTeamsInCurrentGame();
    return res.status(200).json(snakeToCamel(teams));
});

routes.delete('/team/:teamId', async (req, res) => {
    console.debug('params', req.params)
    const { teamId } = req.params
    await deleteTeam(teamId);
    return res.status(200).json();
});


// --- Export or Start ---


module.exports = routes;
