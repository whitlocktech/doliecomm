const companyDatabase = require('./company.mongo')
const axios = require('axios')
const { getStateByCityAndZip } = require('../../util/statefinder')
require('dotenv').config()

const DOLIBARR_URL = process.env.DOLIBARR_URL
const DOLAPIKEY = process.env.DOLAPIKEY

async function getCompanyFromDolibarr() {
  try {
    const dolibarrResponse = await axios.get(`${DOLIBARR_URL}/setup/company?DOLAPIKEY=${DOLAPIKEY}`)
    const dolibarrCompany = dolibarrResponse.data

    const state = await getStateByCityAndZip(dolibarrCompany.town, dolibarrCompany.zip)

    const socialNetworks = [];
for (const [networkName, networkUrl] of Object.entries(dolibarrCompany.socialnetworks)) { 
  if (networkUrl) { 
    socialNetworks.push({
      name: networkName,
      url: networkUrl,
      active: true
    });
  }
}

    const update = {
      companyId: dolibarrCompany.id,
      name: dolibarrCompany.name,
      object: dolibarrCompany.object,
      address: dolibarrCompany.address,
      city: dolibarrCompany.town,
      state: state,
      zipCode: dolibarrCompany.zip,
      email: dolibarrCompany.email,
      phone: dolibarrCompany.phone,
      socialNetworks: socialNetworks,
    }

    await companyDatabase.findOneAndUpdate({}, update, { upsert: true })

  } catch (error) {
    throw new Error(`Error getting company from Dolibarr: ${error.message}`)
  }
}

async function getCompany() {
  try {
    const company = await companyDatabase.findOne()
    return company
  } catch (error) { 
    throw new Error(`Error getting company from database: ${error.message}`)
  }
}

module.exports = {
  getCompanyFromDolibarr,
  getCompany
}