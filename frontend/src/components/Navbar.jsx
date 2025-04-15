import { Link } from 'react-router-dom';

function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav style={{ backgroundColor: '#008080', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: 'white', fontSize: '1.5rem', marginRight: '20px' }}>DesiShop</span>
        <input
          type="text"
          placeholder="Search products..."
          style={{ padding: '5px', borderRadius: '5px', border: 'none', outline: 'none', width: '200px' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#FF6F00', margin: '0 10px', textDecoration: 'none', fontSize: '1rem' }}>Home</Link>
        <Link to="/cart" style={{ color: '#FF6F00', margin: '0 10px', textDecoration: 'none', fontSize: '1rem' }}>Cart</Link>
        <Link to="/profile" style={{ color: '#FF6F00', margin: '0 10px', textDecoration: 'none', fontSize: '1rem' }}>Profile</Link>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{ backgroundColor: '#FF6F00', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={{ color: '#FF6F00', margin: '0 10px', textDecoration: 'none', fontSize: '1rem' }}>Login</Link>
            <Link to="/signup" style={{ color: '#FF6F00', margin: '0 10px', textDecoration: 'none', fontSize: '1rem' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;