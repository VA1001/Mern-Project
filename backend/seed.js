const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => console.log(err));

const products = [
  {
    name: 'Gaming Laptop',
    description: 'High-performance laptop with RTX 3060 GPU',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    stock: 15,
  },
  {
    name: 'Smartphone Pro',
    description: 'Latest 5G smartphone with 128GB storage',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa3',
    stock: 25,
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling over-ear headphones',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba001bc',
    stock: 30,
  },
];

const seedDB = async () => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();