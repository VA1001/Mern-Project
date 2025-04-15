import axios from 'axios';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const addToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/cart',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Added to cart');
    } catch (err) {
      console.error('Add to cart error:', err.message);
      alert('Failed to add to cart');
    }
  };

  // Convert USD to INR (1 USD = ₹85)
  const priceInRupees = (product.price * 85).toFixed(2);

  return (
    <div className="product-card">
      {product.stock < 10 && <span className="sale-badge">Low Stock!</span>}
      <img src={product.image} alt={product.name} className="product-image" />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <p className="product-price">₹{priceInRupees}</p>
      <p className="product-stock">{product.stock} left</p>
      <button className="button add-to-cart" onClick={addToCart}>
        Add to Cart
      </button>
    </div>
  );
}