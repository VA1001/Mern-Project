const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const auth = require('../middleware/auth');

const generateAccessToken = async () => {
  const auth = Buffer.from(
    process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_SECRET
  ).toString('base64');
  const response = await axios({
    url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    method: 'post',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: 'grant_type=client_credentials',
  });
  return response.data.access_token;
};

router.post('/create', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const totalInINR = cart.items.reduce(
      (total, item) => total + item.quantity * item.productId.price,
      0
    );
    const totalInUSD = (totalInINR / 85).toFixed(2);
    const accessToken = await generateAccessToken();
    const response = await axios({
      url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: totalInUSD,
            },
          },
        ],
      },
    });
    console.log('Created PayPal order:', response.data);
    res.json({ orderId: response.data.id, totalInINR });
  } catch (err) {
    console.error('Create order error:', err.message);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

router.post('/capture', auth, async (req, res) => {
  const { orderId, address } = req.body;
  try {
    const accessToken = await generateAccessToken();
    const response = await axios({
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Captured PayPal order:', response.data);
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    const order = new Order({
      userId: req.user.id,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      })),
      total: cart.items.reduce((total, item) => total + item.quantity * item.productId.price, 0),
      paypalOrderId: orderId,
      status: 'completed',
      address,
      isMock: false,
    });
    await order.save();
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } }
    );
    await User.findByIdAndUpdate(req.user.id, { address });
    res.json({ status: response.data.status, orderId });
  } catch (err) {
    console.error('Capture order error:', err.message);
    res.status(500).json({ message: 'Failed to capture order' });
  }
});

router.post('/mock', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const address = req.body.address;
    const mockOrderId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const order = new Order({
      userId: req.user.id,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      })),
      total: cart.items.reduce((total, item) => total + item.quantity * item.productId.price, 0),
      paypalOrderId: mockOrderId,
      status: 'completed',
      address,
      isMock: true,
    });
    await order.save();
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } }
    );
    await User.findByIdAndUpdate(req.user.id, { address });
    res.json({ status: 'COMPLETED', orderId: mockOrderId });
  } catch (err) {
    console.error('Mock order error:', err.message);
    res.status(500).json({ message: 'Failed to create mock order' });
  }
});

module.exports = router;