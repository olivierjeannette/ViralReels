// ViralReels - Stripe Payment Service
// Last updated: 2026-01-19

import Stripe from 'stripe';
import { Plan } from '@prisma/client';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Prix IDs Stripe (à configurer dans le dashboard Stripe)
export const STRIPE_PRICE_IDS: Record<Plan, string | null> = {
  FREE: null,
  CREATOR: process.env.STRIPE_CREATOR_PRICE_ID || 'price_creator_monthly',
  PRO: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
};

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'viralreels',
    },
  });
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: 7, // 7 jours d'essai gratuit
    },
    allow_promotion_codes: true,
  });
}

/**
 * Create a customer portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, immediately: boolean = false) {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  } else {
    // Cancel at period end
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'always_invoice', // Prorata immédiat
  });
}

/**
 * Create a promotion code
 */
export async function createPromotionCode(
  couponId: string,
  code: string,
  maxRedemptions?: number
): Promise<Stripe.PromotionCode> {
  return stripe.promotionCodes.create({
    coupon: couponId,
    code,
    max_redemptions: maxRedemptions,
  });
}

/**
 * Create a coupon
 */
export async function createCoupon(
  percentOff?: number,
  amountOff?: number,
  currency: string = 'eur',
  duration: 'once' | 'repeating' | 'forever' = 'once',
  durationInMonths?: number
): Promise<Stripe.Coupon> {
  return stripe.coupons.create({
    percent_off: percentOff,
    amount_off: amountOff,
    currency: amountOff ? currency : undefined,
    duration,
    duration_in_months: duration === 'repeating' ? durationInMonths : undefined,
  });
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Get plan from price ID
 */
export function getPlanFromPriceId(priceId: string): Plan | null {
  const entries = Object.entries(STRIPE_PRICE_IDS) as [Plan, string | null][];

  for (const [plan, id] of entries) {
    if (id === priceId) {
      return plan;
    }
  }

  return null;
}

/**
 * Get price ID from plan
 */
export function getPriceIdFromPlan(plan: Plan): string | null {
  return STRIPE_PRICE_IDS[plan];
}
