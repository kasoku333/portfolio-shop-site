import { getStripe } from "./stripe";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import type Stripe from "stripe";

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = parseInt(session.client_reference_id || "0", 10);
  const customerEmail = session.customer_email || "";
  const customerName = session.metadata?.customer_name || "";

  if (!userId || !customerEmail) {
    console.error("[Webhook] Invalid session data:", { userId, customerEmail });
    return;
  }

  try {
    // Get line items from session
    const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);

    // Calculate total amount
    const totalAmount = (session.amount_total || 0) / 100;

    // Create order
    const orderResult = await db.createOrder({
      userId,
      stripePaymentIntentId: session.payment_intent as string,
      status: "completed",
      totalAmount: totalAmount.toString(),
      customerEmail,
      customerName,
      shippingAddress: undefined,
    });

    // Notify owner
    await notifyOwner({
      title: "新規注文が入りました",
      content: `顧客: ${customerName} (${customerEmail})\n合計金額: ¥${totalAmount.toLocaleString()}\n注文ID: ${orderResult}`,
    });

    console.log("[Webhook] Order created successfully:", { userId, totalAmount });
  } catch (error) {
    console.error("[Webhook] Error processing checkout session:", error);
    throw error;
  }
}

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("[Webhook] Payment intent succeeded:", paymentIntent.id);
  // Additional processing if needed
}

export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  console.error("[Webhook] Payment intent failed:", paymentIntent.id);
  // Handle failed payment
}
