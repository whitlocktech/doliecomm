const express = require('express')
const {
  getUserByIdController,
} = require('./users.controller')

const usersRouter = express.Router()

usersRouter.get('/:userId', getUserByIdController)

module.exports = usersRouter