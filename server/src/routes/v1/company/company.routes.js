const express = require('express')
const { getCompanyController } = require('./company.controller')

const companyRouter = express.Router()

companyRouter.get('/', getCompanyController)

module.exports = companyRouter