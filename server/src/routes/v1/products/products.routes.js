const express = require('express')
const {
  getAllProductsController,
  getProductsForSaleController,
  getProductsByCategoryController,
  getProductController,
} = require('./products.controller')

const productsRouter = express.Router()

productsRouter.get('/', getAllProductsController)
productsRouter.get('/for-sale', getProductsForSaleController)
productsRouter.get('/by-category/:categoryId', getProductsByCategoryController)
productsRouter.get('/:productId', getProductController)

module.exports = productsRouter