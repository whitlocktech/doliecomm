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
          phone: user.phone,
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
async function syncUsersDatabaseToDolibarr() {
  try {
    const users = await userDatabase.find({})
    const existingThirdParties = await axios.get(`${DOLIBARR_URL}/thirdparties?DOLAPIKEY=${DOLAPIKEY}`)
    for (const user of users) {
      const { userId, username, email, name, firstName, LastName, address, city, zipCode, role } = user
      
      if (role === "admin") {
        console.log(`Skipping admin user ${username}`)
        continue
      }

      const existingThirdParty = existingThirdParties.data.find(thirdParty => thirdParty.id === user.userId)
      if (existingThirdParty) {
        console.log(`Skipping existing user ${username}`)
        continue
      }
      const thirdPartyData = {
        email: email,
        name: `${firstName} ${lastName}`,
        email: email,
        firstName: firstName,
        lastName: lastName,
        address: address,
        town: city,
        zip: zipCode,
      }
      const response = await axios.post(`${DOLIBARR_URL}/thirdparties?DOLAPIKEY=${DOLAPIKEY}`, thirdPartyData, {
        Headers: {
          'Content-Type': 'application/json',
        }
      })
      if (response.status === 200) {
        console.log(`Successfully created user ${username}`)
      } else { 
        console.log(`Error Syncing user ${username} to Dolibarr`)
      }
    }
  } catch (error) { 
    throw new Error(`Error syncing users database to Dolibarr: ${error.message}`)
  }
}

async function getAdminUsersFromDolibarr() {
  try {
    const dolibarrResponse = await axios.get(`${DOLIBARR_URL}/users?DOLAPIKEY=${DOLAPIKEY}`)
    const users = dolibarrResponse.data
    for (const user of users) {
      if (user.employee === 1) {
        const existingUser = await userDatabase.findOne({ userId: user.id })
        if (existingUser) { 
          continue
        }
        const name = `${user.firstname} ${user.lastname}`
        const state = await getStateByCityAndZip(user.town, user.zip) // Define state using getStateByCityAndZip
        const newUser = new userDatabase({
          userId: user.id,
          username: user.login,
          password: generateRandomPassword(10),
          email: user.email,
          name: name,
          firstName: user.firstname,
          lastName: user.lastname,
          address: user.address,
          city: user.town,
          state: state, // Assign state
          zipCode: user.zip,
          phone: user.personal_mobile,
          role: user.admin === '1'
        })
        await newUser.save()
      }
    }
  } catch (error) {
    throw new Error(`Error getting admin users from Dolibarr: ${error.message}`);
  }
}

async function updateUser(userId, updatedFields) {
  try {
    // Pull the entire user object from the database
    const user = await userDatabase.findOne({ userId });

    if (!user) {
      throw new Error(`User with userId ${userId} not found`);
    }

    // Update the user object with the provided updatedFields
    Object.assign(user, updatedFields);

    // Map user fields to Dolibarr API fields
    const mappedUser = {
      code_client: user.userCode,
      email: user.email,
      lastname: user.lastName,
      firstname: user.firstName,
      town: user.city,
      zip: user.zipCode,
      state: user.state,
      address: user.address,
      personal_mobile: user.phone,
      admin: user.role === 'admin' ? '1' : '0'
      // ... add other field mappings as needed
    };

    // Push the update to the Dolibarr API
    const dolibarrUpdateResponse = await axios.put(
      `${DOLIBARR_URL}/thirdparties/${user.userCode}?DOLAPIKEY=${DOLAPIKEY}`,
      mappedUser
    );

    // Save the updated user object back to the database
    await user.save();

    // Return the updated user and Dolibarr API response
    return { user};
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
}


module.exports = {
  getUsersFromDolibarr,
  syncOrdersToUsers,
  getUserById,
  syncUsersDatabaseToDolibarr,
  getAdminUsersFromDolibarr,
  updateUser,
}