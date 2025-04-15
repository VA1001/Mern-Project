import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Added name state
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      await axios.post('http://localhost:5000/api/users/signup', { name, email, password });
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err.message, err.response?.data);
      setError(`Error signing up. Status: ${err.response?.status}, Message: ${err.response?.data?.message || 'Check console for details.'}`);
    }
  };

  return (
    <div className="form-container">
      <h1>Signup</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <button type="submit">Signup</button>
      </form>
      <p>
        Already have an account? <a href="/login" style={{ color: '#008080' }}>Login</a>
      </p>
    </div>
  );
}