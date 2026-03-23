import { db } from "@/lib/db";
import { properties, bookings, guests, transactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendWhatsApp } from "@/lib/waha";

// Simple in-memory session store (resets on cold start, fine for MVP)
const sessions = new Map<string, { step: string; data: Record<string, any>; updatedAt: number }>();

// Clean old sessions (>30 min)
function cleanSessions() {
  const now = Date.now();
  for (const [key, sess] of sessions) {
    if (now - sess.updatedAt > 30 * 60 * 1000) sessions.delete(key);
  }
}

function getSession(phone: string) {
  cleanSessions();
  return sessions.get(phone) || { step: "start", data: {}, updatedAt: Date.now() };
}

function setSession(phone: string, step: string, data: Record<string, any> = {}) {
  const existing = sessions.get(phone);
  sessions.set(phone, {
    step,
    data: { ...(existing?.data || {}), ...data },
    updatedAt: Date.now(),
  });
}

function clearSession(phone: string) {
  sessions.delete(phone);
}

export async function handleIncomingMessage(from: string, text: string): Promise<string> {
  const phone = from.replace("@c.us", "");
  const msg = text.trim().toLowerCase();
  const session = getSession(phone);

  // Reset command
  if (msg === "отмена" || msg === "заново" || msg === "cancel") {
    clearSession(phone);
    return "Хорошо, начнём заново. Напишите город или «поиск» для подбора квартиры.";
  }

  // Help
  if (msg === "помощь" || msg === "help" || msg === "/start") {
    clearSession(phone);
    return `Добро пожаловать в RentPro! 🏠

Я помогу найти и забронировать квартиру посуточно.

Напишите:
• Название города (например: Тараз)
• «поиск» — показать все доступные квартиры
• «отмена» — начать заново

Или забронируйте на сайте: booking.truest.kz/search`;
  }

  // Step-based flow
  switch (session.step) {
    case "start": {
      // Interpret as city search
      const city = text.trim() || "Тараз";
      const available = await db.select().from(properties).where(eq(properties.status, "active"));
      const filtered = msg === "поиск" || msg === "search"
        ? available
        : available.filter((p) => p.city.toLowerCase().includes(city.toLowerCase()));

      if (filtered.length === 0) {
        return `К сожалению, квартир в «${city}» пока нет.\n\nПопробуйте другой город или напишите «поиск» для всех вариантов.`;
      }

      const list = filtered.slice(0, 5).map((p, i) => {
        return `*${i + 1}.* ${p.name}\n   📍 ${p.address}, ${p.city}\n   🛏 ${p.rooms}к, до ${p.maxGuests} гостей\n   💰 ${p.priceWeekday?.toLocaleString("ru-KZ")} ₸/ночь`;
      }).join("\n\n");

      setSession(phone, "choose_property", {
        properties: filtered.slice(0, 5).map((p) => ({ id: p.id, name: p.name, price: p.priceWeekday, userId: p.userId })),
      });

      return `Найдено ${filtered.length} вариантов:\n\n${list}\n\nНапишите номер (1-${Math.min(filtered.length, 5)}) для бронирования.`;
    }

    case "choose_property": {
      const idx = parseInt(msg) - 1;
      const props = session.data.properties || [];
      if (isNaN(idx) || idx < 0 || idx >= props.length) {
        return `Напишите номер от 1 до ${props.length}.`;
      }

      const selected = props[idx];
      setSession(phone, "enter_checkin", { selectedProperty: selected });

      return `Отлично! Вы выбрали: *${selected.name}*\n\nВведите дату заезда (например: 2026-04-01 или 01.04):`;
    }

    case "enter_checkin": {
      const date = parseDate(text.trim());
      if (!date) {
        return "Не понял дату. Введите в формате ГГГГ-ММ-ДД или ДД.ММ:";
      }
      setSession(phone, "enter_checkout", { checkIn: date });
      return `Заезд: *${date}*\n\nВведите дату выезда:`;
    }

    case "enter_checkout": {
      const date = parseDate(text.trim());
      if (!date) {
        return "Не понял дату. Введите в формате ГГГГ-ММ-ДД или ДД.ММ:";
      }

      const checkIn = session.data.checkIn;
      if (date <= checkIn) {
        return "Дата выезда должна быть позже заезда. Попробуйте снова:";
      }

      const nights = Math.ceil(
        (new Date(date).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );
      const price = nights * (session.data.selectedProperty?.price || 0);

      setSession(phone, "enter_name", { checkOut: date, nights, totalPrice: price });

      return `📅 ${checkIn} → ${date} (${nights} ноч.)\n💰 Итого: *${price.toLocaleString("ru-KZ")} ₸*\n\nВаше имя:`;
    }

    case "enter_name": {
      if (text.trim().length < 2) {
        return "Введите ваше имя (минимум 2 символа):";
      }
      setSession(phone, "confirm", { guestName: text.trim() });

      const d = session.data;
      return `Подтвердите бронирование:\n\n🏠 ${d.selectedProperty?.name}\n📅 ${d.checkIn} → ${d.checkOut} (${d.nights} ноч.)\n👤 ${text.trim()}\n📱 +${phone}\n💰 *${d.totalPrice?.toLocaleString("ru-KZ")} ₸*\n\nНапишите *да* для подтверждения или *отмена* для отмены.`;
    }

    case "confirm": {
      if (msg !== "да" && msg !== "yes" && msg !== "ок" && msg !== "ok") {
        if (msg === "нет" || msg === "no") {
          clearSession(phone);
          return "Бронирование отменено. Напишите город для нового поиска.";
        }
        return "Напишите *да* для подтверждения или *отмена* для отмены.";
      }

      const d = session.data;
      const prop = d.selectedProperty;

      // Check availability
      const existingBookings = await db.select().from(bookings).where(eq(bookings.propertyId, prop.id));
      const hasOverlap = existingBookings.some(
        (b) => b.status !== "cancelled" && b.checkIn < d.checkOut && b.checkOut > d.checkIn
      );

      if (hasOverlap) {
        clearSession(phone);
        return "К сожалению, эти даты уже заняты. Напишите город для нового поиска.";
      }

      // Create guest
      const [guest] = await db.insert(guests).values({
        userId: prop.userId,
        name: d.guestName,
        phone: `+${phone}`,
      }).returning();

      // Create booking
      const [booking] = await db.insert(bookings).values({
        propertyId: prop.id,
        guestId: guest.id,
        userId: prop.userId,
        checkIn: d.checkIn,
        checkOut: d.checkOut,
        nights: d.nights,
        totalPrice: d.totalPrice,
        status: "pending",
        source: "whatsapp",
        paymentStatus: "pending",
        guestName: d.guestName,
        guestPhone: `+${phone}`,
      }).returning();

      // Create transaction
      await db.insert(transactions).values({
        userId: prop.userId,
        propertyId: prop.id,
        bookingId: booking.id,
        type: "income",
        category: "Бронирование",
        amount: d.totalPrice,
        date: d.checkIn,
        description: `${d.guestName} — ${d.nights} ноч. (WhatsApp)`,
      });

      clearSession(phone);

      return `✅ Бронирование создано!\n\n🏠 ${prop.name}\n📅 ${d.checkIn} → ${d.checkOut}\n💰 ${d.totalPrice?.toLocaleString("ru-KZ")} ₸\n\nВладелец получит уведомление и подтвердит бронь.\n\nСпасибо, что выбрали RentPro! 🙏`;
    }

    default: {
      clearSession(phone);
      return "Что-то пошло не так. Напишите город для поиска квартиры.";
    }
  }
}

function parseDate(input: string): string | null {
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  // DD.MM or DD.MM.YYYY
  const dotMatch = input.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?$/);
  if (dotMatch) {
    const day = dotMatch[1].padStart(2, "0");
    const month = dotMatch[2].padStart(2, "0");
    const year = dotMatch[3] || new Date().getFullYear().toString();
    return `${year}-${month}-${day}`;
  }
  return null;
}
