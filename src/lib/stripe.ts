import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with a default test key if not provided
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_default",
);

export const initiateDeposit = async (amount: number, accountId: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe failed to load");

    // Create a payment intent through your backend
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, accountId }),
    });

    const { clientSecret } = await response.json();

    // Confirm the payment
    const result = await stripe.confirmCardPayment(clientSecret);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  } catch (error) {
    console.error("Payment failed:", error);
    throw error;
  }
};

export const initiateWithdrawal = async (amount: number, accountId: string) => {
  try {
    const response = await fetch("/api/initiate-withdrawal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, accountId }),
    });

    if (!response.ok) {
      throw new Error("Withdrawal request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Withdrawal failed:", error);
    throw error;
  }
};
