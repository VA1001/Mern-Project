const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { totalAmount, shippingAddress } = req.body;
    const user = await User.findById(req.user.userId).populate('cart.productId');

    if (!user.cart.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const options = {
      amount: totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create order in database
    const order = new Order({
      userId: req.user.userId,
      products: user.cart.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      })),
      totalAmount,
      shippingAddress,
      razorpayOrderId: razorpayOrder.id,
    });

    await order.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Verify payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Update order status
      await Order.findByIdAndUpdate(dbOrderId, {
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: 'completed',
      });

      // Clear cart
      await User.findByIdAndUpdate(req.user.userId, { cart: [] });

      res.json({ status: 'success', message: 'Payment verified' });
    } else {
      await Order.findByIdAndUpdate(dbOrderId, { paymentStatus: 'failed' });
      res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// Get Razorpay key
router.get('/key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;