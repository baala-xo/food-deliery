'use client'; // <-- Ensure this is at the top

import { useCart } from '../contexts/CartContext';

export default function MenuItemCard({ item }) {
  const { addToCart } = useCart();

  return (
    <div className="menu-item-card">
      <h3>{item.name}</h3>
      <p className="description">{item.description}</p>
      <p className="price">${parseFloat(item.price).toFixed(2)}</p>
      <button onClick={() => addToCart(item)} className="add-to-cart-btn">
        Add to Cart
      </button>
    </div>
  );
}