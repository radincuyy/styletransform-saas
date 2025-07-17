import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Only load Stripe if the key is available and not a placeholder
const stripePromise = (
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY && 
  !process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY.includes('pk_test_51234567890abcdef')
) ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) : null;

const StripeContext = createContext();

export function useStripe() {
  return useContext(StripeContext);
}

export function StripeProvider({ children }) {
  // If no Stripe key, just provide context without Elements wrapper
  if (!stripePromise) {
    return (
      <StripeContext.Provider value={{ stripePromise: null }}>
        {children}
      </StripeContext.Provider>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeContext.Provider value={{ stripePromise }}>
        {children}
      </StripeContext.Provider>
    </Elements>
  );
}