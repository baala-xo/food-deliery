'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage({ params }) {
  // Unwrap the params Promise using React.use()
  const unwrappedParams = use(params);
  
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [trackingStage, setTrackingStage] = useState(0);

  const deliveryStages = [
    { stage: 'Order Confirmed', time: '0 min', icon: '✓' },
    { stage: 'Preparing Food', time: '10 min', icon: '👨‍🍳' },
    { stage: 'Out for Delivery', time: '25 min', icon: '🚗' },
    { stage: 'Delivered', time: '35 min', icon: '📦' }
  ];

  useEffect(() => {
    fetchRestaurantAndItems();
    // If there's a specific item from URL params, add it to cart
    if (unwrappedParams.itemId) {
      const itemId = parseInt(unwrappedParams.itemId);
      setCartItems([{ id: itemId, quantity: 1, name: 'Selected Item', price: 12.99 }]);
    }
  }, [unwrappedParams.restaurantId, unwrappedParams.itemId]);

  async function fetchRestaurantAndItems() {
    const { data: restaurantData } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', unwrappedParams.restaurantId)
      .single();
    
    if (restaurantData) {
      setRestaurant(restaurantData);
      // Generate fake menu items
      const fakeItems = [
        { id: 1, name: 'Burger Deluxe', price: 12.99, image: '/api/placeholder/200/150' },
        { id: 2, name: 'Chicken Wings', price: 9.99, image: '/api/placeholder/200/150' },
        { id: 3, name: 'Caesar Salad', price: 8.99, image: '/api/placeholder/200/150' },
        { id: 4, name: 'Pasta Carbonara', price: 14.99, image: '/api/placeholder/200/150' },
        { id: 5, name: 'Pizza Margherita', price: 16.99, image: '/api/placeholder/200/150' },
      ];
      setMenuItems(fakeItems);
    } else {
      router.push('/restaurants');
    }
  }

  function addToCart(item) {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  }

  function updateQuantity(itemId, change) {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean);
    });
  }

  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          calculateEstimatedDelivery();
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use fake location as fallback
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
          calculateEstimatedDelivery();
        }
      );
    } else {
      // Use fake location if geolocation not supported
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
      calculateEstimatedDelivery();
    }
  }

  function calculateEstimatedDelivery() {
    // Fake calculation with random values
    const fakeDistance = (Math.random() * 5 + 1).toFixed(1); // 1-6 km
    const fakeTime = Math.floor(Math.random() * 20 + 25); // 25-45 minutes
    const deliveryFee = (parseFloat(fakeDistance) * 1.5 + 3).toFixed(2);
    
    setEstimatedDelivery({
      distance: `${fakeDistance} km`,
      time: `${fakeTime} min`,
      fee: deliveryFee
    });
  }

  async function confirmOrder() {
    if (cartItems.length === 0) {
      alert('Please add items to your cart.');
      return;
    }
    
    if (!userLocation) {
      alert('Please get your location for delivery.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in.');
      return;
    }

    // Simulate order placement
    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      restaurant_id: unwrappedParams.restaurantId,
    });

    if (error) {
      alert('There was an error placing your order.');
    } else {
      setOrderPlaced(true);
      startTracking();
    }
  }

  function startTracking() {
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setTrackingStage(stage);
      if (stage >= deliveryStages.length - 1) {
        clearInterval(interval);
      }
    }, 3000); // Progress every 3 seconds for demo
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = estimatedDelivery ? parseFloat(estimatedDelivery.fee) : 0;
  const total = subtotal + deliveryFee;

  if (!restaurant) {
    return <div className="container">Loading...</div>;
  }

  if (orderPlaced) {
    return (
      <div className="container">
        <div className="tracking-container">
          <h1>Order Tracking</h1>
          <div className="restaurant-info">
            <h2>{restaurant.name}</h2>
            <p>Order Total: ${total.toFixed(2)}</p>
          </div>
          
          <div className="tracking-progress">
            {deliveryStages.map((stage, index) => (
              <div key={index} className={`tracking-stage ${index <= trackingStage ? 'active' : ''}`}>
                <div className="stage-icon">{stage.icon}</div>
                <div className="stage-info">
                  <h3>{stage.stage}</h3>
                  <p>{stage.time}</p>
                </div>
                {index < deliveryStages.length - 1 && <div className="stage-line"></div>}
              </div>
            ))}
          </div>

          <div className="delivery-map-placeholder">
            <h3>📍 Delivery Location</h3>
            <div className="map-placeholder">
              <div className="delivery-truck">🚚</div>
              <p>Tracking your delivery...</p>
            </div>
          </div>

          <button onClick={() => router.push('/restaurants')} className="button-primary">
            Order More Food
          </button>
        </div>

        <style jsx>{`
          .tracking-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .restaurant-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
          }
          .tracking-progress {
            margin: 30px 0;
          }
          .tracking-stage {
            display: flex;
            align-items: center;
            margin: 20px 0;
            opacity: 0.5;
            transition: opacity 0.3s;
          }
          .tracking-stage.active {
            opacity: 1;
          }
          .stage-icon {
            font-size: 24px;
            width: 40px;
            height: 40px;
            background: #e9ecef;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
          }
          .tracking-stage.active .stage-icon {
            background: #28a745;
            color: white;
          }
          .stage-info h3 {
            margin: 0 0 5px 0;
            font-size: 16px;
          }
          .stage-info p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
          .delivery-map-placeholder {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .map-placeholder {
            height: 200px;
            background: #e9ecef;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-top: 10px;
          }
          .delivery-truck {
            font-size: 48px;
            animation: bounce 2s infinite;
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <Link href={`/restaurants`} className='back-link'>
        &larr; Back to Restaurants
      </Link>
      <h1>Order from {restaurant.name}</h1>
      
      <div className="checkout-layout">
        <div className="menu-section">
          <h2>Menu Items</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div key={item.id} className="menu-item-card">
                
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price}</p>
                  <button onClick={() => addToCart(item)} className="button-primary">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2>Your Order</h2>
          
          {cartItems.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>${item.price}</p>
                  </div>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)} className="quantity-btn">-</button>
                    <span className="quantity">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="quantity-btn">+</button>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="location-section">
            <h3>Delivery Location</h3>
            <button onClick={getCurrentLocation} className="location-btn">
              📍 Get Current Location
            </button>
            {userLocation && (
              <div className="location-info">
                <p>✓ Location obtained</p>
                <small>Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}</small>
              </div>
            )}
          </div>

          {estimatedDelivery && (
            <div className="delivery-estimate">
              <h3>Delivery Estimate</h3>
              <div className="estimate-details">
                <p><strong>Distance:</strong> {estimatedDelivery.distance}</p>
                <p><strong>Time:</strong> {estimatedDelivery.time}</p>
                <p><strong>Delivery Fee:</strong> ${estimatedDelivery.fee}</p>
              </div>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="order-summary">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Delivery Fee:</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="summary-line total">
                <span><strong>Total:</strong></span>
                <span><strong>${total.toFixed(2)}</strong></span>
              </div>
            </div>
          )}

          <button 
            onClick={confirmOrder} 
            className="button-primary checkout-btn" 
            disabled={cartItems.length === 0 || !userLocation}
          >
            Place Order
          </button>
        </div>
      </div>

      <style jsx>{`
        .checkout-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
          margin-top: 20px;
        }
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        .menu-item-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s;
        }
        .menu-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .item-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          background: #f0f0f0;
        }
        .item-info {
          padding: 15px;
        }
        .item-info h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
        }
        .item-price {
          font-size: 16px;
          font-weight: bold;
          color: #28a745;
          margin: 5px 0 10px 0;
        }
        .cart-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          height: fit-content;
          sticky: top-20px;
        }
        .cart-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .item-details h4 {
          margin: 0;
          font-size: 14px;
        }
        .item-details p {
          margin: 2px 0 0 0;
          color: #666;
          font-size: 12px;
        }
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .quantity-btn {
          width: 24px;
          height: 24px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
        }
        .quantity-btn:hover {
          background: #f0f0f0;
        }
        .quantity {
          min-width: 20px;
          text-align: center;
          font-weight: bold;
        }
        .item-total {
          font-weight: bold;
          min-width: 60px;
          text-align: right;
        }
        .location-section {
          margin: 20px 0;
          padding: 15px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          text-align: center;
        }
        .location-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        .location-btn:hover {
          background: #0056b3;
        }
        .location-info {
          margin-top: 10px;
          color: #28a745;
        }
        .delivery-estimate {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .estimate-details p {
          margin: 5px 0;
          display: flex;
          justify-content: space-between;
        }
        .order-summary {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .summary-line {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }
        .summary-line.total {
          border-top: 1px solid #ddd;
          padding-top: 8px;
          margin-top: 10px;
        }
        .checkout-btn {
          width: 100%;
          padding: 15px;
          font-size: 16px;
          font-weight: bold;
        }
        .checkout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}