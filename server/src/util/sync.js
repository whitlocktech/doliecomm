const { getCompanyFromDolibarr } = require("../models/company/company.model")
const { dolibarrCategoriesSync } = require("../models/categories/categories.model")
const {
  getProductsFromDolibarr,
  updateProductCategoriesFromDolibarr,
} = require("../models/products/products.model")
const {
  getOrdersFromDolibarr,
} = require("../models/orders/orders.model")
const {
  getUsersFromDolibarr,
  syncOrdersToUsers,
} = require("../models/users/users.model")

async function syncWithDolibarr() { 
  try {
    await getCompanyFromDolibarr()
    await dolibarrCategoriesSync()
    await getProductsFromDolibarr()
    await updateProductCategoriesFromDolibarr()
    await getOrdersFromDolibarr()
    await getUsersFromDolibarr()
    await syncOrdersToUsers()
  } catch (error) { 
    throw new Error(`Error syncing with Dolibarr: ${error.message}`)
  }
}

async function intervalSync() {
  try {
    await syncWithDolibarr();
    setTimeout(intervalSync, 10 * 60 * 1000); // Schedule the next update in 10 minutes
  } catch (error) { 
    throw new Error(`Interval Sync Error: ${error.message}`)
  }
}

module.exports = {
  intervalSync,
}
