const express = require('express')
const {
  getAllCategoriesController,
  getCategoryController,
} = require('./categories.controller')

const categoriesRouter = express.Router()

categoriesRouter.get('/', getAllCategoriesController)
categoriesRouter.get('/:categoryId', getCategoryController)

module.exports = categoriesRouter