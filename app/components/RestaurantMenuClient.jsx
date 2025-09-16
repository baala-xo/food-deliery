'use client';

import { useState } from 'react';
import MenuItemCard from './MenuItemCard';
import '../styles/main.css';

export default function RestaurantMenuClient({ restaurant, initialMenuItems }) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  return (
    <div className="container">
      <div className="restaurant-details-container">
        <header className="restaurant-details-header">
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>
        </header>

        <section className="menu-section">
          <h2>Menu</h2>
          <div className="menu-items-grid">
            {menuItems.map(item => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}