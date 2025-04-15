import { useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const { orderId } = state || {};

  return (
    <div className="order-confirmation">
      <h2>Thank You for Your Order!</h2>
      <p className="order-message">Your order has been placed successfully.</p>
      {orderId && (
        <div className="order-details">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Status:</strong> Confirmed</p>
          <p><strong>Delivery:</strong> Expected in 5-7 days</p>
          <p><strong>Address:</strong> {localStorage.getItem('checkoutAddress') ? JSON.parse(localStorage.getItem('checkoutAddress')).street : 'N/A'}</p>
        </div>
      )}
      <a href="/" className="button continue-shopping">Continue Shopping</a>
    </div>
  );
}