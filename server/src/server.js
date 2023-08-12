const http = require('http')
const fs = require('fs')
const path = require('path')

const app = require('./app')
const { mongoConnect } = require('./util/mongo')
const { intervalSync } = require('./util/sync')

require('dotenv').config()

const PORT = process.env.PORT || 3000

const server = http.createServer(app)

async function startServer() {
  try {
    await mongoConnect()
    await intervalSync()
    const imagesDirectory = path.join(__dirname, '..', 'public', 'images')
    if (!fs.existsSync(imagesDirectory)) { 
      fs.mkdirSync(imagesDirectory)
      console.log('Images Directory Created')
    }
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.log('Error Starting Server: ', error)
  }
}
startServer()