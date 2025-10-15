const config = require('./src/config')

const { server } = require('./src/app')

server.listen(config.port, () => {
    console.log("Server listening on", { port: config.port })
    console.debug(config)
})
