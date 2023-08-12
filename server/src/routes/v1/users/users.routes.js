const express = require('express')
const {
  getUserByIdController,
  updateUserController,
} = require('./users.controller')

const usersRouter = express.Router()

usersRouter.get('/:userId', getUserByIdController)
usersRouter.put('/:userId', updateUserController)

module.exports = usersRouter