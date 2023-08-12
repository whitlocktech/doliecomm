const {
  getCompany,
} = require('../../../models/company/company.model')

async function getCompanyController(req, res) {
  try {
    const company = await getCompany()
    res.status(200).json(company)
  } catch (error) { 
    throw new Error(`Error getting company from database: ${error.message}`)
  }
}

module.exports = {
  getCompanyController
}