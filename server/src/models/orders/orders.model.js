const ordersDatabase = require('./orders.mongo')
const productsDatabase = require('../products/products.mongo')
const userDatabase = require('../users/users.mongo')
const axios = require('axios');
require('dotenv').config();

const DOLIBARR_URL = process.env.DOLIBARR_URL;
const DOLAPIKEY = process.env.DOLAPIKEY;

async function getOrdersFromDolibarr() {
  try {
    const dolibarrResponse = await axios.get(`${DOLIBARR_URL}/orders?DOLAPIKEY=${DOLAPIKEY}&limit=1000`);
    const dolibarrOrders = dolibarrResponse.data;
    for (const order of dolibarrOrders) {
      const existingOrder = await ordersDatabase.findOne({ orderId: order.id })
      if (existingOrder) { 
        return
      }
      const user = await userDatabase.findOne({ userId: order.socid})

      const newOrder = new ordersDatabase({
        orderId: order.id,
        ref: order.ref,
        orderDate: new Date(order.date_validation * 1000),
        total: order.total_ttc,
        paid: order.statut === '3',
        onlinePayment: order.online_payment_url,
        customer: user ? user._id : null,
        customerId: order.socid,
        billed: order.billed === '1',
        products: order.lines.map(line => {
          return {
            productId: line.fk_product,
            ref: line.product_ref,
            name: line.product_label,
            quantity: line.qty,
            price: line.total_ht,
          }
        }),
        expectedDeliveryDate: new Date(order.delivery_date * 1000),
        subtotal: order.multicurrency_total_ht,
        tax: order.multicurrency_total_tva,
      })
      await newOrder.save()
    }
  } catch (error) {
    throw new Error(`Error getting orders from Dolibarr: ${error.message}`);
  }
}

module.exports = {
  getOrdersFromDolibarr,
};
