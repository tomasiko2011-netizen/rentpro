const WAHA_URL = process.env.WAHA_URL || "http://89.207.255.137:63012";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

interface SendMessageParams {
  phone: string;
  text: string;
}

export async function sendWhatsApp({ phone, text }: SendMessageParams) {
  // Normalize phone: remove +, spaces, dashes
  const chatId = phone.replace(/[\s\-+]/g, "") + "@c.us";

  try {
    const res = await fetch(`${WAHA_URL}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(WAHA_API_KEY && { "X-Api-Key": WAHA_API_KEY }),
      },
      body: JSON.stringify({
        session: "default",
        chatId,
        text,
      }),
    });

    if (!res.ok) {
      console.error("WAHA send error:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("WAHA send failed:", error);
    return false;
  }
}

// Message templates
export const templates = {
  bookingConfirmed(guestName: string, propertyName: string, checkIn: string, checkOut: string, price: number) {
    return `Здравствуйте, ${guestName}!

Ваше бронирование подтверждено:
- Объект: ${propertyName}
- Заезд: ${checkIn}
- Выезд: ${checkOut}
- Стоимость: ${price.toLocaleString("ru-KZ")} ₸

Спасибо, что выбрали нас! Если есть вопросы — пишите.`;
  },

  checkInReminder(guestName: string, propertyName: string, address: string, checkInTime: string) {
    return `${guestName}, напоминаем о заезде сегодня!

- Объект: ${propertyName}
- Адрес: ${address}
- Время заезда: ${checkInTime}

Ждём вас!`;
  },

  checkOutReminder(guestName: string, checkOutTime: string) {
    return `${guestName}, напоминаем о выезде сегодня до ${checkOutTime}.

Спасибо за пребывание! Будем рады видеть вас снова.`;
  },

  newBookingOwner(guestName: string, guestPhone: string, propertyName: string, checkIn: string, checkOut: string, price: number) {
    return `Новое бронирование!

- Гость: ${guestName} (${guestPhone})
- Объект: ${propertyName}
- ${checkIn} → ${checkOut}
- ${price.toLocaleString("ru-KZ")} ₸

Подтвердите в RentPro: booking.truest.kz`;
  },
};
