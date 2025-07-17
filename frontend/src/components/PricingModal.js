import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function PricingModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '5 style transformations',
        'Basic image quality',
        'Standard processing time',
        'Email support'
      ],
      buttonText: 'Current Plan',
      disabled: true
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      features: [
        '100 style transformations',
        'High-quality images',
        'Priority processing',
        'Advanced AI models',
        'Priority support',
        'Commercial usage rights'
      ],
      buttonText: 'Upgrade Now',
      popular: true,
      priceId: 'price_premium_monthly' // Replace with your actual Stripe price ID
    }
  ];

  const handleUpgrade = async (priceId) => {
    if (!currentUser) {
      toast.error('Please log in to upgrade');
      return;
    }

    // Check if Stripe is configured
    if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY.includes('your_stripe')) {
      toast.error('Payment system is not configured yet. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/payment/create-checkout-session', {
        priceId,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/dashboard?canceled=true`
      }, {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      // Check if Stripe is loaded
      if (window.Stripe) {
        const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({
          sessionId: response.data.sessionId
        });
      } else {
        toast.error('Payment system is loading. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to start checkout process');
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Choose Your Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative border rounded-xl p-4 sm:p-6 ${
                  plan.popular
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.priceId && handleUpgrade(plan.priceId)}
                  disabled={plan.disabled || loading}
                  className={`w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    plan.popular
                      ? 'bg-primary-500 hover:bg-primary-600 text-white'
                      : plan.disabled
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {loading ? 'Processing...' : plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600">
            <p>
              All plans include secure payment processing and can be cancelled anytime.
            </p>
            <p className="mt-2">
              Questions? Contact us at support@styletransform.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingModal;