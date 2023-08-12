const mongoose = require('mongoose')
require('dotenv').config()

const MONGO_DB_URL = process.env.MONGO_DB_URL
if (!MONGO_DB_URL) { 
  console.log('Missing MONGO_DB_URL!!!')
  process.exit(1)
}

mongoose.connection.on('connected', () => {
  console.log('MongoDB Connected')
})

async function mongoConnect() { 
  try {
    await mongoose.connect(MONGO_DB_URL)
  } catch (error) { 
    console.log('Error Connecting to MongoDB: ', error)
    process.exit(1)
  }
}

module.exports = { mongoConnect }