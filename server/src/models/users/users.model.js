const { getStateByCityAndZip } = require('../../util/statefinder')
const userDatabase = require('./users.mongo')
const ordersDatabase = require('../orders/orders.mongo')
const axios = require('axios')
require('dotenv').config()

const DOLIBARR_URL = process.env.DOLIBARR_URL
const DOLAPIKEY = process.env.DOLAPIKEY

function generateRandomPassword(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
}

async function getUsersFromDolibarr() { 
  try {
    const dolibarrResponse = await axios.get(`${DOLIBARR_URL}/thirdparties?DOLAPIKEY=${DOLAPIKEY}`)
    const dolibarrUsers = dolibarrResponse.data

    for (const user of dolibarrUsers) { 
      if (user.code_client) {
        const existingUser = await userDatabase.findOne({ userId: user.id })
        if (existingUser) { 
          continue
        }
        const nameParts = user.name ? user.name.split(' ') : []
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ')
        const state = await getStateByCityAndZip(user.town, user.zip)
        const newUser = new userDatabase({
          userId: user.id,
          userCode: user.code_client,
          username: user.email,
          password: generateRandomPassword(10),
          email: user.email,
          name: user.name,
          firstName: firstName,
          lastName: lastName,
          address: user.address,
          city: user.town,
          state: state,
          zipCode: user.zip,
        })
        await newUser.save()
      }
    }
  } catch (error) { 
    throw new Error(`Error getting users from Dolibarr: ${error.message}`)
  }
}

async function syncOrdersToUsers() {
  try {
    const allOrders = await ordersDatabase.find({}); // Retrieve all orders

    for (const order of allOrders) {
      const user = await userDatabase.findOne({ userId: order.customerId }); // Retrieve user by customerId

      if (user) {
        if (!user.orders) {
          user.orders = []; // Initialize the orders array if not exists
        }
        if (!user.orders.includes(order._id)) {
          user.orders.push(order._id); // Add order to user's orders array
          await user.save(); // Save user
        }
      }
    }
  } catch (error) {
    throw new Error(`Error syncing orders to users: ${error.message}`);
  }
}

async function getUserById(userId) { 
  try {
    const user = await userDatabase.findOne({ userId })
      .populate('orders')
      .exec()
    return user
  } catch (error) { 
    throw new Error(`Error getting user by id: ${error.message}`)
  }
}


module.exports = {
  getUsersFromDolibarr,
  syncOrdersToUsers,
  getUserById,
}