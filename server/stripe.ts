import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set. Set it in .env to enable payments.");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export async function createCheckoutSession(params: {
  items: Array<{
    productId: number;
    name: string;
    price: number; // JPY amount (integer)
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) {
  const stripe = getStripe();

  const lineItems = params.items.map((item) => ({
    price_data: {
      currency: "jpy",
      product_data: {
        name: item.name,
      },
      unit_amount: item.price, // JPY is zero-decimal currency
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ...(params.customerEmail && { customer_email: params.customerEmail }),
  });

  return session;
}

export async function getCheckoutSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId);
}
