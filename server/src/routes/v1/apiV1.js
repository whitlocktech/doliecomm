const express = require('express')
const companyRouter = require('./company/company.routes')
const categoriesRouter = require('./categories/categories.routes')
const productsRouter = require('./products/products.routes')
const usersRouter = require('./users/users.routes')

const apiV1Router = express.Router()

apiV1Router.use('/company', companyRouter)
apiV1Router.use('/categories', categoriesRouter)
apiV1Router.use('/products', productsRouter)
apiV1Router.use('/users', usersRouter)

module.exports = apiV1Router