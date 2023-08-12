const mongoose = require('mongoose')

const productsSchema = new mongoose.Schema({
  productId: {
    type: String,
  },
  status: {
    type: String,
  },
  ref: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
  },
  description: {
    type: String,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories',
    },
    {
      name: {
        type: String,
      }
    }
  ],
  stockCount: {
    type: Number,
  },
  instock: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
})

module.exports = mongoose.model('Product', productsSchema)