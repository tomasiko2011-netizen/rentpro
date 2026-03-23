import { db } from "@/lib/db";
import { users, properties, bookings, guests, transactions, blockedDates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Owner commands via WhatsApp
// Owner is identified by phone number matching users.phone

export async function findOwnerByPhone(phone: string): Promise<any | null> {
  const allUsers = await db.select().from(users);
  const normalized = phone.replace(/[\s\-+]/g, "");
  return allUsers.find((u) => {
    const uPhone = (u.phone || "").replace(/[\s\-+]/g, "");
    return uPhone && normalized.endsWith(uPhone.slice(-10));
  }) || null;
}

export async function handleOwnerCommand(userId: string, text: string): Promise<string | null> {
  const msg = text.trim().toLowerCase();

  // Брони на сегодня / завтра
  if (msg.includes("брони на сегодня") || msg === "сегодня" || msg === "брони") {
    return await getBookingsForDate(userId, 0);
  }
  if (msg.includes("брони на завтра") || msg === "завтра") {
    return await getBookingsForDate(userId, 1);
  }

  // Доход за месяц
  if (msg.includes("доход") || msg.includes("заработ") || msg.includes("выручка")) {
    return await getRevenueReport(userId, msg);
  }

  // Статистика
  if (msg === "статистика" || msg === "стат" || msg === "статус") {
    return await getQuickStats(userId);
  }

  // Подтверди бронь
  const confirmMatch = msg.match(/подтверди\s+(.*)/);
  if (confirmMatch) {
    return await confirmBooking(userId, confirmMatch[1]);
  }

  // Заблокируй
  const blockMatch = msg.match(/заблокируй\s+(.+)\s+(\d{1,2}[.\-]\d{1,2})\s*[-–]\s*(\d{1,2}[.\-]\d{1,2})/);
  if (blockMatch) {
    return await blockDates(userId, blockMatch[1], blockMatch[2], blockMatch[3]);
  }

  // Объекты
  if (msg === "объекты" || msg === "квартиры" || msg === "мои объекты") {
    return await listProperties(userId);
  }

  // Помощь для хозяина
  if (msg === "команды" || msg === "хозяин" || msg === "owner") {
    return getOwnerHelp();
  }

  return null; // Not an owner command
}

async function getBookingsForDate(userId: string, daysOffset: number): Promise<string> {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const dateStr = date.toISOString().split("T")[0];
  const label = daysOffset === 0 ? "сегодня" : "завтра";

  const allBookings = await db.select().from(bookings).where(eq(bookings.userId, userId));
  const dayBookings = allBookings.filter(
    (b) => b.status !== "cancelled" && b.checkIn <= dateStr && b.checkOut > dateStr
  );

  if (dayBookings.length === 0) {
    return `На ${label} (${dateStr}) бронирований нет.`;
  }

  const allProps = await db.select().from(properties).where(eq(properties.userId, userId));

  const lines = dayBookings.map((b) => {
    const prop = allProps.find((p) => p.id === b.propertyId);
    const statusIcon = { pending: "🟡", confirmed: "🔵", checked_in: "🟢", checked_out: "⚪" }[b.status] || "⚪";
    return `${statusIcon} ${prop?.name || "?"}\n   ${b.guestName || "?"} (${b.guestPhone || "?"})\n   ${b.checkIn} → ${b.checkOut}, ${b.totalPrice?.toLocaleString("ru-KZ")} ₸`;
  });

  return `Брони на ${label} (${dateStr}):\n\n${lines.join("\n\n")}`;
}

async function getRevenueReport(userId: string, msg: string): Promise<string> {
  const allTx = await db.select().from(transactions).where(eq(transactions.userId, userId));

  // Determine period
  let fromDate: string;
  let periodLabel: string;
  const now = new Date();

  if (msg.includes("неделю") || msg.includes("неделя")) {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    fromDate = d.toISOString().split("T")[0];
    periodLabel = "за неделю";
  } else {
    // Default: current month
    fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    periodLabel = `за ${now.toLocaleDateString("ru-RU", { month: "long" })}`;
  }

  const filtered = allTx.filter((t) => t.date >= fromDate);
  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const profit = income - expense;

  const bookingCount = filtered.filter((t) => t.type === "income" && t.category === "Бронирование").length;

  return `Финансы ${periodLabel}:\n\n` +
    `📈 Доход: ${income.toLocaleString("ru-KZ")} ₸\n` +
    `📉 Расход: ${expense.toLocaleString("ru-KZ")} ₸\n` +
    `💰 Прибыль: ${profit.toLocaleString("ru-KZ")} ₸\n` +
    `📋 Бронирований: ${bookingCount}`;
}

async function getQuickStats(userId: string): Promise<string> {
  const props = await db.select().from(properties).where(eq(properties.userId, userId));
  const allBookings = await db.select().from(bookings).where(eq(bookings.userId, userId));
  const active = allBookings.filter((b) => b.status !== "cancelled");
  const guestList = await db.select().from(guests).where(eq(guests.userId, userId));

  const today = new Date().toISOString().split("T")[0];
  const currentlyOccupied = active.filter((b) => b.checkIn <= today && b.checkOut > today).length;
  const pending = active.filter((b) => b.status === "pending").length;

  return `📊 Статистика:\n\n` +
    `🏠 Объектов: ${props.length}\n` +
    `🔵 Заселено сейчас: ${currentlyOccupied}\n` +
    `🟡 Ожидают подтверждения: ${pending}\n` +
    `📋 Всего бронирований: ${active.length}\n` +
    `👤 Гостей в базе: ${guestList.length}`;
}

async function confirmBooking(userId: string, query: string): Promise<string> {
  const allBookings = await db.select().from(bookings).where(
    and(eq(bookings.userId, userId), eq(bookings.status, "pending"))
  );

  if (allBookings.length === 0) {
    return "Нет ожидающих подтверждения бронирований.";
  }

  // Try to match by guest name or booking ID prefix
  const match = allBookings.find((b) =>
    b.guestName?.toLowerCase().includes(query.toLowerCase()) ||
    b.id.startsWith(query)
  );

  if (!match) {
    const list = allBookings.map((b) => `• ${b.guestName} (${b.checkIn} → ${b.checkOut})`).join("\n");
    return `Не нашёл бронь "${query}". Ожидающие:\n${list}`;
  }

  await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, match.id));

  return `✅ Бронь подтверждена!\n${match.guestName}, ${match.checkIn} → ${match.checkOut}, ${match.totalPrice?.toLocaleString("ru-KZ")} ₸`;
}

async function blockDates(userId: string, propertyQuery: string, fromRaw: string, toRaw: string): Promise<string> {
  const props = await db.select().from(properties).where(eq(properties.userId, userId));
  const prop = props.find((p) => p.name.toLowerCase().includes(propertyQuery.toLowerCase()));

  if (!prop) {
    const names = props.map((p) => `• ${p.name}`).join("\n");
    return `Не нашёл объект "${propertyQuery}". Ваши объекты:\n${names}`;
  }

  const year = new Date().getFullYear();
  const parseShortDate = (raw: string) => {
    const parts = raw.split(/[.\-]/);
    return `${year}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  };

  const dateFrom = parseShortDate(fromRaw);
  const dateTo = parseShortDate(toRaw);

  await db.insert(blockedDates).values({
    propertyId: prop.id,
    dateFrom,
    dateTo,
    reason: "Заблокировано хозяином через WhatsApp",
  });

  return `🔒 Заблокировано:\n${prop.name}\n${dateFrom} → ${dateTo}`;
}

async function listProperties(userId: string): Promise<string> {
  const props = await db.select().from(properties).where(eq(properties.userId, userId));

  if (props.length === 0) return "У вас нет объектов.";

  const lines = props.map((p) => {
    const status = p.status === "active" ? "🟢" : p.status === "maintenance" ? "🔧" : "⚪";
    return `${status} ${p.name}\n   ${p.address}, ${p.city}\n   ${p.priceWeekday?.toLocaleString("ru-KZ")} ₸/ночь`;
  });

  return `Ваши объекты (${props.length}):\n\n${lines.join("\n\n")}`;
}

function getOwnerHelp(): string {
  return `🏠 Команды хозяина:\n\n` +
    `• *сегодня* — брони на сегодня\n` +
    `• *завтра* — брони на завтра\n` +
    `• *доход* — финансы за месяц\n` +
    `• *доход за неделю* — за 7 дней\n` +
    `• *статистика* — общая сводка\n` +
    `• *объекты* — список объектов\n` +
    `• *подтверди Нурлан* — подтвердить бронь\n` +
    `• *заблокируй Студия 25.03-27.03* — заблокировать даты\n\n` +
    `Для гостевого бронирования напишите название города.`;
}
