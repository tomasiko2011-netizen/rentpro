// Kaspi Pay integration
// Kaspi QR API: https://pay.kaspi.kz/docs
// For MVP we generate a payment link that guest opens in Kaspi app

const KASPI_MERCHANT_ID = process.env.KASPI_MERCHANT_ID || "";
const KASPI_API_KEY = process.env.KASPI_API_KEY || "";

export interface KaspiPaymentParams {
  bookingId: string;
  amount: number;
  description: string;
  returnUrl?: string;
}

export interface KaspiPaymentResult {
  paymentUrl: string;
  paymentId: string;
  qrUrl: string;
}

// Generate Kaspi payment link
// When Kaspi Pay API keys are not set, returns a demo/placeholder link
export async function createKaspiPayment({
  bookingId,
  amount,
  description,
  returnUrl,
}: KaspiPaymentParams): Promise<KaspiPaymentResult> {
  const paymentId = `RP-${bookingId.slice(0, 8).toUpperCase()}`;

  // If real Kaspi API configured
  if (KASPI_MERCHANT_ID && KASPI_API_KEY) {
    try {
      const res = await fetch("https://pay.kaspi.kz/api/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KASPI_API_KEY}`,
        },
        body: JSON.stringify({
          merchantId: KASPI_MERCHANT_ID,
          amount: Math.round(amount),
          currency: "KZT",
          description,
          orderId: paymentId,
          returnUrl: returnUrl || `${process.env.NEXTAUTH_URL || "https://rentpro-nu.vercel.app"}/booking-success`,
          callbackUrl: `${process.env.NEXTAUTH_URL || "https://rentpro-nu.vercel.app"}/api/payments/kaspi`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          paymentUrl: data.paymentUrl || data.redirectUrl,
          paymentId,
          qrUrl: data.qrUrl || data.paymentUrl,
        };
      }
    } catch (error) {
      console.error("Kaspi API error:", error);
    }
  }

  // Demo mode: generate a human-readable payment instruction
  return {
    paymentUrl: "", // No real URL without API keys
    paymentId,
    qrUrl: "",
  };
}

// Format payment message for WhatsApp/UI
export function formatPaymentMessage(
  amount: number,
  paymentId: string,
  paymentUrl: string,
): string {
  if (paymentUrl) {
    return `Оплатите через Kaspi Pay:\n${paymentUrl}\n\nСумма: ${amount.toLocaleString("ru-KZ")} ₸\nНомер заказа: ${paymentId}`;
  }

  // Fallback: manual transfer instruction
  return `Оплата: ${amount.toLocaleString("ru-KZ")} ₸\nНомер заказа: ${paymentId}\n\nДля оплаты переведите на Kaspi Gold владельца с указанием номера заказа. После оплаты бронь будет подтверждена.`;
}

// Verify Kaspi webhook signature
export function verifyKaspiSignature(body: string, signature: string): boolean {
  if (!KASPI_API_KEY) return false;
  // TODO: implement HMAC verification when real keys are available
  return true;
}
