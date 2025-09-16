// app/components/RestaurantCard.js
export default function RestaurantCard({ restaurant }) {
    return (
      <div className="restaurant-card">
        <div className="restaurant-card-content">
          <h3>{restaurant.name}</h3>
          <p>{restaurant.description}</p>
          <span className="status-badge">Open</span>
        </div>
      </div>
    );
  }