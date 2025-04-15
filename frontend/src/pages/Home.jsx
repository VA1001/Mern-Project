import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Fetch products error:', err.message);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home">
      <div className="hero-banner">
        <h1>Diwali Dhamaka Sale!</h1>
        <p>Up to 50% Off on Electronics & More</p>
        <button className="button banner-button">Shop Now</button>
      </div>
      <section className="new-arrivals">
        <h2>New Arrivals</h2>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
      <div className="ad-banner">
        <h3>Exclusive Offer: Buy 2, Get 10% Off!</h3>
        <p>Stock up on your favorites today.</p>
      </div>
    </div>
  );
}