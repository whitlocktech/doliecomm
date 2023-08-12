const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const usersSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  userCode: {
    type: String,
  },
  username: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 8,
    maxLength: 120,
  },
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'customer'],
    default: 'customer',
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'orders',
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

usersSchema.pre('save', async function (next) { 
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword
  } catch (error) { 
    next(error)
  }
})

usersSchema.methods.isValidPassword = async function (password) { 
  try {
    return await bcrypt.compare(password, this.password)
  } catch (error) { 
    throw new Error(`Error validating password: ${error.message}`)
  }
}

module.exports = mongoose.model('User', usersSchema)