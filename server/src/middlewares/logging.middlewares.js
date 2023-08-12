const fs = require('fs')
const path = require('path')
const morgan = require('morgan')
const winston = require('winston')

const logsDirectory = path.join(__dirname, '..', '..', 'logs')
const accessLogPath = path.join(logsDirectory, 'access.log')
const errorLogPath = path.join(logsDirectory, 'error.log')
const infoLogPath = path.join(logsDirectory, 'info.log')

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory)
}

const accessLogStream = fs.createWriteStream(accessLogPath, { flags: 'a' })

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: errorLogPath, level: 'error' }),
    new winston.transports.File({ filename: infoLogPath, level: 'info' })
  ],
})

const logToConsole = (...args) => { 
  logger.info(...args)
}

const logErrorToConsole = (...args) => {
  logger.error(...args);
};

const loggingMiddlewares = (req, res, next) => {
  morgan('combined', { stream: accessLogStream })(req, res, () => {
    const originalSend = res.send
    res.send = function (data) {
      const status = res.statusCode
      const message = res.statusMessage || ''
      if (status >= 400) {
        logger.error(`[${status}] ${message} - ${req.method} ${req.originalUrl}`)
      }
      res.send = originalSend
      return res.send(data)
    }
    next()
  })
}

console.log = logToConsole
console.error = logErrorToConsole

module.exports = { loggingMiddlewares }