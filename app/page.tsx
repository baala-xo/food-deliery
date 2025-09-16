'use client'; // This component needs to be interactive

import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.log(error);
    }
  }

  // Check if a user is already logged in and redirect them
  async function checkUserAndRedirect() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/restaurants');
    }
  }

  // Run the check on component mount
  checkUserAndRedirect();

  return (
    <div className="container">
      <h1>Welcome to FoodDash</h1>
      <p>Your favorite food, delivered fast.</p>
      <button onClick={signInWithGoogle} className="button-primary">
        Sign In with Google
      </button>
    </div>
  );
}