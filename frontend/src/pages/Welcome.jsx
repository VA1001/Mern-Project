import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div className="welcome">
      <div className="welcome-container">
        <h1>Welcome to E-Shop</h1>
        <p>Your one-stop shop for electronics and more!</p>
        <div className="welcome-buttons">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/signup" className="btn btn-secondary">Signup</Link>
        </div>
      </div>
    </div>
  );
}