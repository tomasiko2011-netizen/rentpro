import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/wa-bot";
import { findOwnerByPhone, handleOwnerCommand } from "@/lib/wa-owner";
import { sendWhatsApp } from "@/lib/waha";

// WAHA webhook — receives incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.event !== "message") return NextResponse.json({ ok: true });

    const payload = body.payload;
    if (!payload || payload.fromMe) return NextResponse.json({ ok: true });

    const from = payload.from; // "77771234567@c.us"
    const text = payload.body || payload.text || "";
    if (!from || !text) return NextResponse.json({ ok: true });

    const phone = from.replace("@c.us", "");

    // Check if sender is a registered owner
    const owner = await findOwnerByPhone(phone);

    let reply: string;

    if (owner) {
      // Try owner commands first
      const ownerReply = await handleOwnerCommand(owner.id, text);
      if (ownerReply) {
        reply = ownerReply;
      } else {
        // Not an owner command — fall through to guest bot
        reply = await handleIncomingMessage(from, text);
      }
    } else {
      // Regular guest
      reply = await handleIncomingMessage(from, text);
    }

    await sendWhatsApp({ phone, text: reply });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "rentpro-whatsapp" });
}
