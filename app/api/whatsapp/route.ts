import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/wa-bot";
import { sendWhatsApp } from "@/lib/waha";

// WAHA webhook — receives incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // WAHA sends different event types
    const event = body.event;

    // Only handle incoming messages
    if (event !== "message") {
      return NextResponse.json({ ok: true });
    }

    const payload = body.payload;
    if (!payload) return NextResponse.json({ ok: true });

    // Skip outgoing messages (from us)
    if (payload.fromMe) return NextResponse.json({ ok: true });

    const from = payload.from; // e.g. "77771234567@c.us"
    const text = payload.body || payload.text || "";

    if (!from || !text) return NextResponse.json({ ok: true });

    // Process message through bot
    const reply = await handleIncomingMessage(from, text);

    // Send reply back
    const phone = from.replace("@c.us", "");
    await sendWhatsApp({ phone, text: reply });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ ok: true }); // Always 200 to avoid WAHA retries
  }
}

// WAHA health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "rentpro-whatsapp" });
}
