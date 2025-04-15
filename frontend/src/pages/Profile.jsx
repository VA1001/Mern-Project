import { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: { fullName: '', street: '', city: '', state: '', pinCode: '' },
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/users/orders', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUser(userRes.data);
        setOrders(ordersRes.data);
        setFormData({
          name: userRes.data.name,
          phone: userRes.data.phone,
          address: userRes.data.address || {
            fullName: '',
            street: '',
            city: '',
            state: '',
            pinCode: '',
          },
          password: '',
        });
      } catch (err) {
        console.error('Fetch profile error:', err.message);
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.user);
      setIsEditing(false);
      setError('');
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Update profile error:', err.message);
      setError('Failed to update profile');
    }
  };

  if (!user) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile">
      <h2>My Profile</h2>
      {error && <p className="profile-error">{error}</p>}
      <div className="profile-content">
        <div className="profile-card">
          <h3>User Information</h3>
          {!isEditing ? (
            <div className="user-info">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
              <p><strong>Address:</strong> {user.address.street
                ? `${user.address.fullName}, ${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.pinCode}`
                : 'Not set'}</p>
              <button
                className="button edit-button"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form className="edit-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.fullName">Full Name (Address)</label>
                <input
                  type="text"
                  id="address.fullName"
                  name="address.fullName"
                  value={formData.address.fullName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.street">Street Address</label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.city">City</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.state">State</label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.pinCode">PIN Code</label>
                <input
                  type="text"
                  id="address.pinCode"
                  name="address.pinCode"
                  value={formData.address.pinCode}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">New Password (optional)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="button save-button">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="button cancel-button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="order-history">
          <h3>Order History</h3>
          {orders.length === 0 ? (
            <p className="no-orders">No orders yet</p>
          ) : (
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.paypalOrderId}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>₹{order.total.toFixed(2)}</td>
                    <td>{order.status}</td>
                    <td>{order.isMock ? 'Demo' : 'Real'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}