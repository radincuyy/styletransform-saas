const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/firebase');
const analytics = require('../utils/analytics');

const router = express.Router();

// POST /api/payment/create-checkout-session - Create Stripe checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { priceId, successUrl, cancelUrl } = req.body;

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
      console.warn('Stripe not configured, returning mock response');
      return res.status(400).json({ 
        error: 'Payment system not configured',
        message: 'Stripe integration is not set up yet'
      });
    }

    // Check if database is available
    if (!db) {
      console.warn('Database not available for payment processing');
      return res.status(500).json({ 
        error: 'Database not available',
        message: 'Cannot process payments without database'
      });
    }

    // Create or get Stripe customer
    let customer;
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    if (userData.stripeCustomerId) {
      customer = await stripe.customers.retrieve(userData.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          firebaseUID: uid
        }
      });

      // Save customer ID to user document
      await db.collection('users').doc(uid).update({
        stripeCustomerId: customer.id
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebaseUID: uid
      }
    });

    // Track payment attempt
    analytics.trackPayment(uid, 'subscription', 'usd', false); // false = attempt, not completed yet

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// POST /api/payment/webhook - Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Check if Stripe webhook secret is configured
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes('your_webhook')) {
    console.warn('Stripe webhook secret not configured');
    return res.status(400).json({ error: 'Webhook not configured' });
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Check if database is available
    if (!db) {
      console.warn('Database not available for webhook processing');
      return res.status(500).json({ error: 'Database not available' });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const firebaseUID = session.metadata.firebaseUID;
        
        if (firebaseUID) {
          await db.collection('users').doc(firebaseUID).update({
            isPremium: true,
            subscriptionStatus: 'active',
            stripeSubscriptionId: session.subscription,
            subscriptionStartDate: new Date()
          });
          
          // Track successful payment
          analytics.trackPayment(firebaseUID, session.amount_total / 100, 'usd', true);
          
          console.log(`User ${firebaseUID} upgraded to premium`);
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const uid = customer.metadata.firebaseUID;
        
        if (uid) {
          const isActive = subscription.status === 'active';
          await db.collection('users').doc(uid).update({
            isPremium: isActive,
            subscriptionStatus: subscription.status,
            subscriptionEndDate: isActive ? null : new Date()
          });
          console.log(`User ${uid} subscription status updated to ${subscription.status}`);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/payment/subscription - Get user's subscription info
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
      return res.json({ 
        hasSubscription: false,
        isPremium: false,
        message: 'Payment system not configured'
      });
    }

    // Check if database is available
    if (!db) {
      return res.json({ 
        hasSubscription: false,
        isPremium: false,
        message: 'Database not available'
      });
    }
    
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    if (!userData.stripeSubscriptionId) {
      return res.json({ 
        hasSubscription: false,
        isPremium: false 
      });
    }

    const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId);
    
    res.json({
      hasSubscription: true,
      isPremium: userData.isPremium || false,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch subscription info',
      hasSubscription: false,
      isPremium: false
    });
  }
});

// POST /api/payment/cancel-subscription - Cancel user's subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
      return res.status(400).json({ 
        error: 'Payment system not configured',
        message: 'Stripe integration is not set up yet'
      });
    }

    // Check if database is available
    if (!db) {
      return res.status(500).json({ 
        error: 'Database not available',
        message: 'Cannot process subscription changes without database'
      });
    }
    
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    if (!userData.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    await stripe.subscriptions.update(userData.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    res.json({ success: true, message: 'Subscription will be cancelled at the end of the current period' });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error.message 
    });
  }
});

module.exports = router;