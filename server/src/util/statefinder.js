const GeoNames = require('geonames.js')
require('dotenv').config()
const GEONAMES_USERNAME = process.env.GEONAMES_USERNAME
const geonames = new GeoNames({ username: GEONAMES_USERNAME, lan: 'en', encoding: 'JSON' })

async function getStateByCityAndZip(city, zip) {
  try {
    const result = await geonames.postalCodeLookup({ postalcode: zip, country: 'US' })
    if (result && result.postalcodes && result.postalcodes.length > 0) {
      return result.postalcodes[0].adminCode1
    }
  } catch (error) { 
    throw new Error(`Error getting state from GeoNames: ${error.message}`)
  }
}

module.exports = {
  getStateByCityAndZip
}