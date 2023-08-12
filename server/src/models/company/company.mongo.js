const mongoose = require('mongoose')

const companySchema = new mongoose.Schema({
  companyId: {
    type: String,
  },
  name: {
    type: String,
  },
  object: {
    type: String,
  },
  address: {
    type: String,
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
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  socialNetworks: [
    {
      name: {
        type: String,
      },
      url: {
        type: String,
      },
      active: {
        type: Boolean,
      }
    }
  ]
})

module.exports = mongoose.model('Company', companySchema)