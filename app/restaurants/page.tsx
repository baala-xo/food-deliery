'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fake menu items for each restaurant
  const menuItems = {
    1: [
      { id: 1, name: 'Burger Deluxe', price: 12.99, image: '/api/placeholder/200/150' },
      { id: 2, name: 'Chicken Wings', price: 9.99, image: '/api/placeholder/200/150' },
      { id: 3, name: 'Caesar Salad', price: 8.99, image: '/api/placeholder/200/150' },
    ],
    2: [
      { id: 4, name: 'Pasta Carbonara', price: 14.99, image: '/api/placeholder/200/150' },
      { id: 5, name: 'Pizza Margherita', price: 16.99, image: '/api/placeholder/200/150' },
      { id: 6, name: 'Garlic Bread', price: 5.99, image: '/api/placeholder/200/150' },
    ],
    3: [
      { id: 7, name: 'Sushi Platter', price: 24.99, image: '/api/placeholder/200/150' },
      { id: 8, name: 'Ramen Bowl', price: 13.99, image: '/api/placeholder/200/150' },
      { id: 9, name: 'Tempura Set', price: 18.99, image: '/api/placeholder/200/150' },
    ]
  };

  useEffect(() => {
    async function getRestaurants() {
      // Check for user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/'); // Redirect to login if no user
        return;
      }

      // Fetch data from the 'restaurants' table
      const { data, error } = await supabase.from('restaurants').select('*');

      if (error) {
        console.error('Error fetching restaurants:', error);
      } else {
        setRestaurants(data);
      }
      setLoading(false);
    }

    getRestaurants();
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  function orderItem(restaurantId, item) {
    // Navigate to checkout with specific item
    router.push(`/checkout/${restaurantId}?itemId=${item.id}`);
  }

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Restaurants</h1>
        <button onClick={signOut} className="button-secondary">Sign Out</button>
      </div>

      <div className="restaurants-grid">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="restaurant-card">
            <div className="restaurant-header">
              <img src={restaurant.image_url} alt={restaurant.name} className="restaurant-image" />
              <div className="restaurant-info">
                <h2>{restaurant.name}</h2>
                <p className="cuisine-type">{restaurant.cuisine}</p>
                <div className="restaurant-details">
                  <span className="rating">⭐ 4.5</span>
                  <span className="delivery-time">🕒 25-35 min</span>
                  <span className="delivery-fee">🚚 $3.99</span>
                </div>
              </div>
            </div>
            
            <div className="menu-preview">
              <h3>Popular Items</h3>
              <div className="items-grid">
                {(menuItems[restaurant.id] || menuItems[1]).map((item) => (
                  <div key={item.id} className="menu-item">

                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-price">${item.price}</p>
                      <button 
                        onClick={() => orderItem(restaurant.id, item)}
                        className="order-item-btn"
                      >
                        Order This Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="restaurant-actions">
                <Link href={`/checkout/${restaurant.id}`} className="view-full-menu-btn">
                  View Full Menu & Order
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .restaurants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 30px;
        }
        
        .restaurant-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .restaurant-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .restaurant-header {
          display: flex;
          padding: 20px;
          align-items: center;
          background: #f8f9fa;
        }
        
        .restaurant-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          margin-right: 20px;
        }
        
        .restaurant-info h2 {
          margin: 0 0 5px 0;
          font-size: 24px;
          color: #333;
        }
        
        .cuisine-type {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 16px;
        }
        
        .restaurant-details {
          display: flex;
          gap: 15px;
          font-size: 14px;
        }
        
        .restaurant-details span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .menu-preview {
          padding: 20px;
        }
        
        .menu-preview h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #333;
        }
        
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .menu-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s;
        }
        
        .menu-item:hover {
          transform: translateY(-2px);
        }
        
        .item-image {
          width: 100%;
          height: 100px;
          object-fit: cover;
          background: #f0f0f0;
        }
        
        .item-details {
          padding: 10px;
        }
        
        .item-details h4 {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #333;
        }
        
        .item-price {
          margin: 0 0 10px 0;
          font-weight: bold;
          color: #28a745;
          font-size: 14px;
        }
        
        .order-item-btn {
          width: 100%;
          background: #007bff;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .order-item-btn:hover {
          background: #0056b3;
        }
        
        .restaurant-actions {
          text-align: center;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }
        
        .view-full-menu-btn {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        
        .view-full-menu-btn:hover {
          background: #218838;
          text-decoration: none;
          color: white;
        }
        
        .rating {
          color: #ff6b6b;
        }
        
        .delivery-time {
          color: #4ecdc4;
        }
        
        .delivery-fee {
          color: #45b7d1;
        }
        
        @media (max-width: 768px) {
          .restaurants-grid {
            grid-template-columns: 1fr;
          }
          
          .restaurant-header {
            flex-direction: column;
            text-align: center;
          }
          
          .restaurant-image {
            margin: 0 0 15px 0;
          }
          
          .items-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}