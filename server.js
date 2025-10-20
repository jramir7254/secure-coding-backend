const config = require('./src/config')
const logger = require('@shared/logger')


const { server } = require('./src/app')

server.listen(config.port, () => {
    logger.info("Server listening on", { port: config.port })
    // logger.debug("env", config)
})
