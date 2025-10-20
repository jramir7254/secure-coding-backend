const axios = require('axios')
const { judge0 } = require('./env')



const judge0Api = axios.default.create({
    baseURL: 'https://judge0-ce.p.sulu.sh/submissions?wait=true',
    headers: {
        Authorization: `Bearer ${judge0.key}`,
        Accept: 'application/json',
        "Content-Type": "application/json"
    }
})


const pistonApi = axios.default.create({
    baseURL: 'https://emkc.org/api/v2/piston/execute',
    headers: {
        Accept: 'application/json',
        "Content-Type": "application/json"
    }
})

module.exports = { judge0Api, pistonApi }