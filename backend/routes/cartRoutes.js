const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/cart - User:', req.user.id);
    let cart = await Cart.findOne({ userId: req.user.id });
    console.log('Cart query result:', cart);
    if (!cart) {
      console.log('No cart found, creating new one for user:', req.user.id);
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
      console.log('New cart created:', cart);
    }
    if (cart.items.length > 0) {
      console.log('Populating items.productId');
      await cart.populate('items.productId');
      console.log('Populated cart:', cart.items);
    }
    res.json(cart.items || []);
  } catch (err) {
    console.error('GET /api/cart error:', {
      message: err.message,
      stack: err.stack,
      userId: req.user.id,
    });
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

router.post('/', auth, async (req, res) => {
  const { productId, quantity } = req.body;
  console.log('POST /api/cart - Request:', { userId: req.user.id, productId, quantity });

  if (!productId || !quantity || quantity < 1) {
    console.log('Invalid request data:', { productId, quantity });
    return res.status(400).json({ message: 'Invalid productId or quantity' });
  }

  try {
    console.log('Checking productId:', productId);
    const productExists = await Product.findById(productId);
    console.log('Product query result:', productExists);
    if (!productExists) {
      console.log('Product not found:', productId);
      return res.status(400).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    console.log('Cart query result:', cart);
    if (!cart) {
      console.log('No cart found, creating new one for user:', req.user.id);
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    console.log('Item index:', itemIndex);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      console.log('Updated quantity:', cart.items[itemIndex]);
    } else {
      cart.items.push({ productId, quantity });
      console.log('Added new item:', { productId, quantity });
    }

    await cart.save();
    console.log('Cart saved:', cart);
    if (cart.items.length > 0) {
      console.log('Populating items.productId');
      await cart.populate('items.productId');
      console.log('Populated cart:', cart.items);
    }
    res.json(cart.items);
  } catch (err) {
    console.error('POST /api/cart error:', {
      message: err.message,
      stack: err.stack,
      userId: req.user.id,
      productId,
      quantity,
    });
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

module.exports = router;