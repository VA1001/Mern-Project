import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login again.');
          navigate('/login');
          return;
        }
        console.log('Fetching cart with token:', token.substring(0, 10) + '...');
        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });
        console.log('Cart response:', response.data);
        setCartItems(response.data || []);
        setError('');
      } catch (err) {
        console.error('Fetch cart error:', err.message, err.response?.data);
        setError('Failed to load cart. Check login or server. Details:', err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * (item.productId?.price || 0),
    0
  ).toFixed(2);

  if (loading) {
    return (
      <div className="cart" style={{ textAlign: 'center', padding: '20px', backgroundColor: '#F8F1E9' }}>
        <h2 style={{ color: '#008080' }}>Loading Cart...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart" style={{ textAlign: 'center', padding: '20px', color: '#FF6F00' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{ backgroundColor: '#FF6F00', color: 'white', border: 'none', padding: '5px 10px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {error && <p className="cart-error">{error}</p>}
      {cartItems.length === 0 ? (
        <p className="cart-empty" style={{ color: '#333333' }}>Your cart is empty</p>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <img
                  src={item.productId?.image || 'https://via.placeholder.com/100'}
                  alt={item.productId?.name || 'Product'}
                  className="cart-item-image"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                />
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.productId?.name || 'Unknown Product'}</h3>
                  <p className="cart-item-price">₹{(item.productId?.price * item.quantity || 0).toFixed(2)}</p>
                  <p className="cart-item-quantity">Quantity: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <p className="cart-total">Total: ₹{total}</p>
            <p className="cart-delivery">Estimated Delivery: 5-7 days</p>
            <button className="button checkout-button" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}