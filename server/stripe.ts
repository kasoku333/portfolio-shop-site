import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(stripeSecretKey);

export async function createCheckoutSession(params: {
  userId: number;
  userEmail: string;
  userName: string;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
}) {
  const lineItems = params.items.map((item) => ({
    price_data: {
      currency: "jpy",
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100) / 100,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.userEmail,
    client_reference_id: params.userId.toString(),
    metadata: {
      user_id: params.userId.toString(),
      customer_email: params.userEmail,
      customer_name: params.userName,
    },
  });

  return session;
}

export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function createPaymentIntent(params: {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  return stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: params.currency || "jpy",
    description: params.description,
    metadata: params.metadata,
  });
}
