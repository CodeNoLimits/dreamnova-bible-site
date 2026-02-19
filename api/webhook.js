const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Vercel streams the raw body as a buffer
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("✅ PAIEMENT REÇU:", {
        id: session.id,
        email: session.customer_email,
        amount: session.amount_total / 100,
        currency: session.currency,
        status: session.payment_status,
        created: new Date(session.created * 1000).toISOString(),
      });

      // TODO: Send confirmation email via Resend/FormSubmit
      // TODO: Send Telegram notification to David
      // TODO: Store in database/Google Sheet

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      console.log("⏰ Session expirée:", session.id);
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

// Helper to get raw body from Vercel request
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
