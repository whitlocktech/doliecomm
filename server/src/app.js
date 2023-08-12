const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const rateLimit = require('express-rate-limit')
// const {loggingMiddlewares} = require('./middlewares/logging.middlewares')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500 
})
const app = express()

app.use(limiter)

app.use(express.json())
app.use(helmet())
// app.use(loggingMiddlewares)
app.use(morgan('dev'))
app.use(cors({
  origin: '*'
}))

/*app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URL,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 // 1 day
    }),
  })
)*/

app.get('/', (req, res) => { 
  res.send('Hello World')
})

app.use('/api', require('./routes/api'))
app.use(express.static(path.join(__dirname, '..', 'public')))

module.exports = app