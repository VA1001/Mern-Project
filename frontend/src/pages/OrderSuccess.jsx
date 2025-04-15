import { useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const location = useLocation();
  const paymentId = location.state?.paymentId || 'N/A';

  return (
    <div className="order-success">
      <div className="container">
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your purchase.</p>
        <p>Payment ID: {paymentId}</p>
        <p>Your order will be shipped soon.</p>
      </div>
    </div>
  );
}