'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RestaurantPage({ params }) {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) {
         router.push('/');
         return;
       }

      // Fetch restaurant details
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', params.id)
        .single(); // .single() gets one record instead of an array

      // Fetch menu items for that restaurant
      const { data: menuData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', params.id);

      setRestaurant(restaurantData);
      setMenuItems(menuData);
    }
    fetchData();
  }, [params.id, router]);

  async function handlePlaceOrder() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert('You must be logged in to place an order.');
        return;
    }

    const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        restaurant_id: params.id,
    });

    if (error) {
        alert('There was an error placing your order.');
        console.error(error);
    } else {
        alert('Order placed successfully! (MVP version)');
        router.push('/restaurants');
    }
  }


  if (!restaurant) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <Link href="/restaurants" className='back-link'>&larr; Back to Restaurants</Link>
      <img src={restaurant.image_url} alt={restaurant.name} className="restaurant-image-large" />
      <h1>{restaurant.name}</h1>
      <p>{restaurant.cuisine}</p>

      <h2>Menu</h2>
      <div className="menu-list">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item">
            <div>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
            </div>
            <span>${item.price}</span>
          </div>
        ))}
      </div>

      <Link href={`/checkout/${params.id}`} className="button-primary order-button">
        Go to Checkout
      </Link>
    </div>
  );
}