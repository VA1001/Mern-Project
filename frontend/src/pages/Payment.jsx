import { useState, useEffect } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

export default function Payment() {
  const [cartItems, setCartItems] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(response.data);
      } catch (err) {
        console.error('Fetch cart error:', err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          alert('Failed to load cart');
        }
      }
    };
    fetchCart();
  }, [navigate]);

  const createOrder = async (data, actions) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/orders/create',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.orderId;
    } catch (err) {
      console.error('Create order error:', err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      throw new Error('Failed to create order');
    }
  };

  const onApprove = async (data, actions) => {
    try {
      const token = localStorage.getItem('token');
      const address = JSON.parse(localStorage.getItem('checkoutAddress'));
      const response = await axios.post(
        'http://localhost:5000/api/orders/capture',
        { orderId: data.orderID, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Payment successful');
      localStorage.removeItem('checkoutAddress');
      navigate('/order-confirmation', {
        state: { orderId: response.data.orderId },
      });
    } catch (err) {
      console.error('Capture order error:', err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Payment failed');
      }
    }
  };

  const handleMockPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const address = JSON.parse(localStorage.getItem('checkoutAddress'));
      const response = await axios.post(
        'http://localhost:5000/api/orders/mock',
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Demo payment successful');
      localStorage.removeItem('checkoutAddress');
      navigate('/order-confirmation', {
        state: { orderId: response.data.orderId },
      });
    } catch (err) {
      console.error('Mock payment error:', err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Demo payment failed');
      }
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.productId.price,
    0
  ).toFixed(2);

  return (
    <div className="payment">
      <h2>Complete Your Payment</h2>
      <div className="payment-summary">
        <h3>Order Summary</h3>
        {cartItems.map((item) => (
          <div key={item._id} className="payment-item">
            <p>{item.productId.name}</p>
            <p>₹{(item.productId.price * item.quantity).toFixed(2)} (x{item.quantity})</p>
          </div>
        ))}
        <p className="payment-total">Total: ₹{total}</p>
      </div>
      <div className="demo-toggle">
        <label className="demo-label">
          <input
            type="checkbox"
            checked={isDemoMode}
            onChange={() => setIsDemoMode(!isDemoMode)}
          />
          Demo Mode (Skip Payment)
        </label>
      </div>
      {isDemoMode ? (
        <button className="button demo-payment-button" onClick={handleMockPayment}>
          Complete Demo Payment
        </button>
      ) : (
        <PayPalScriptProvider
          options={{
            clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
            currency: 'USD',
            intent: 'capture',
            components: 'buttons',
            disableFunding: 'paylater,venmo,card',
            debug: false,
          }}
        >
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
              console.error('PayPal button error:', err.message);
              alert('PayPal error. Please try again.');
            }}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
}