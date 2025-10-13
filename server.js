const config = require('./src/config')

const app = require('./src/app')

app.listen(config.port, () => {
    console.log("Server listening on", { port: config.port })
    console.debug(config)
})
