const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
  orderId: {
    type: String,
  },
  ref: {
    type: String,
  },
  orderDate: {
    type: Date,
  },
  total: {
    type: Number,
  },
  paid: {
    type: Boolean,
  },
  shipped: {
    type: Boolean,
  },
  expectedDeliveryDate: {
    type: Date,
  },
  shippingMethod: {
    type: String,
  },
  trackingNumber: {
    type: String,
  },
  trackingUrl: {
    type: String,
  },
  products: [
    {
      productId: {
        type: String,
      },
      ref: {
        type: String,
      },
      name: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      price: {
        type: Number,
      },
    },
  ],
  onlinePayment: {
    type: String,
  },
  customerId: {
    type: String,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  billed: {
    type: Boolean,
  },
  subtotal: {
    type: Number,
  },
  tax: {
    type: Number,
  },
});

module.exports = mongoose.model('orders', ordersSchema);
