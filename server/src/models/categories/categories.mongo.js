const mongoose = require('mongoose')

const categoriesSchema = new mongoose.Schema({
  categoryId: {
    type: Number,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  parentCategoryId: {
    type: Number,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories',
  },
  public: {
    type: Boolean,
  },
  childCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories',
  }],
})

module.exports = mongoose.model('categories', categoriesSchema)