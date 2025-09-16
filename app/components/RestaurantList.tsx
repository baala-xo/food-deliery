// app/components/RestaurantList.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import RestaurantCard from './RestaurantCard';
import '../styles/main.css';

export default function RestaurantList({ initialRestaurants }) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search for restaurants..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      
      {filteredRestaurants.length > 0 ? (
        <div className="restaurant-grid">
          {filteredRestaurants.map(restaurant => (
            <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
              <RestaurantCard restaurant={restaurant} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="no-restaurants">No restaurants found. Please try a different search term.</p>
      )}
    </div>
  );
}