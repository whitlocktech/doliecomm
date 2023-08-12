const {
  getUserById
} = require('../../../models/users/users.model')

async function getUserByIdController(req, res) { 
  try {
    const { userId } = req.params
    const user = await getUserById(userId)
    res.status(200).json(user)
  } catch (error) { 
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getUserByIdController,
}