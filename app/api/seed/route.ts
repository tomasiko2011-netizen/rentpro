import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, properties, bookings, guests, transactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Seed demo data — call once: POST /api/seed?key=rentpro-seed-2026
export async function POST(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== "rentpro-seed-2026") {
    return NextResponse.json({ error: "Invalid key" }, { status: 403 });
  }

  // Check if already seeded
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Already seeded" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash("demo123", 12);

  // Create demo owners
  const [owner1] = await db.insert(users).values({
    email: "arman@rentpro.kz",
    name: "Арман Касымов",
    phone: "+7 777 111 2233",
    passwordHash,
    plan: "standard",
  }).returning();

  const [owner2] = await db.insert(users).values({
    email: "asel@rentpro.kz",
    name: "Асель Нурланова",
    phone: "+7 701 444 5566",
    passwordHash,
    plan: "pro",
  }).returning();

  const [owner3] = await db.insert(users).values({
    email: "demo@rentpro.kz",
    name: "Demo User",
    phone: "+7 700 000 0000",
    passwordHash,
    plan: "free",
  }).returning();

  // Demo properties across KZ cities
  const demoProperties = [
    // Тараз
    { userId: owner1.id, name: "Студия в центре Тараза", type: "studio" as const, address: "ул. Толе Би 45, кв 12", city: "Тараз", rooms: 1, beds: 1, maxGuests: 2, description: "Уютная студия с евроремонтом в самом центре Тараза. Wi-Fi, кондиционер, полностью укомплектованная кухня. 5 минут до Центрального рынка и парка Первого Президента.", priceWeekday: 8000, priceWeekend: 10000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Микроволновка", "Телевизор"]), photos: JSON.stringify([]) },
    { userId: owner1.id, name: "2-комн квартира на Абая", type: "apartment" as const, address: "пр. Абая 120, кв 56", city: "Тараз", rooms: 2, beds: 2, maxGuests: 4, description: "Просторная двушка с видом на горы. Два отдельных спальных места, большая кухня-гостиная. Рядом ТРЦ Grand Park. Идеально для семьи или компании.", priceWeekday: 12000, priceWeekend: 15000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Парковка", "Балкон", "Лифт"]), photos: JSON.stringify([]) },
    { userId: owner1.id, name: "Элитная квартира у Водно-Зелёного", type: "apartment" as const, address: "ул. Казыбек Би 78, кв 3", city: "Тараз", rooms: 3, beds: 3, maxGuests: 6, description: "Трёхкомнатная квартира премиум-класса. Дизайнерский ремонт, джакузи, панорамные окна. В пешей доступности Водно-Зелёный бульвар и Мавзолей Карахана.", priceWeekday: 25000, priceWeekend: 30000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Микроволновка", "Телевизор", "Парковка", "Балкон", "Лифт", "Домофон"]), photos: JSON.stringify([]) },

    // Астана
    { userId: owner2.id, name: "Студия у Байтерек", type: "studio" as const, address: "пр. Мангилик Ел 52, кв 18", city: "Астана", rooms: 1, beds: 1, maxGuests: 2, description: "Современная студия в новом ЖК с видом на Байтерек. Smart TV, капсульная кофемашина, скоростной Wi-Fi. Идеально для командировок.", priceWeekday: 15000, priceWeekend: 20000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Микроволновка", "Телевизор", "Парковка", "Лифт", "Домофон"]), photos: JSON.stringify([]) },
    { userId: owner2.id, name: "2-комн на Левом берегу", type: "apartment" as const, address: "ул. Сыганак 10, кв 87", city: "Астана", rooms: 2, beds: 2, maxGuests: 4, description: "Уютная квартира на Левом берегу. 10 минут до Хан Шатыр. Два санузла, гардеробная, подземная парковка. Консьерж 24/7.", priceWeekday: 22000, priceWeekend: 28000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Телевизор", "Парковка", "Балкон", "Лифт", "Домофон"]), photos: JSON.stringify([]) },
    { userId: owner2.id, name: "Пентхаус в EXPO квартале", type: "apartment" as const, address: "пр. Кабанбай Батыра 62, кв 200", city: "Астана", rooms: 3, beds: 4, maxGuests: 8, description: "Двухуровневый пентхаус с террасой. Сауна, домашний кинотеатр, панорама на весь город. Рядом EXPO, вокзал Нурлы Жол.", priceWeekday: 45000, priceWeekend: 55000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Микроволновка", "Телевизор", "Парковка", "Балкон", "Лифт", "Домофон"]), photos: JSON.stringify([]) },

    // Алматы
    { userId: owner2.id, name: "Студия на Достык", type: "studio" as const, address: "пр. Достык 105, кв 42", city: "Алматы", rooms: 1, beds: 1, maxGuests: 2, description: "Стильная студия в золотом квадрате. Рядом ЦУМ, парк 28 панфиловцев, кафе и рестораны. Отличный вариант для туристов.", priceWeekday: 12000, priceWeekend: 16000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Телевизор", "Лифт"]), photos: JSON.stringify([]) },
    { userId: owner2.id, name: "3-комн у Медеу", type: "apartment" as const, address: "ул. Горная 15", city: "Алматы", rooms: 3, beds: 3, maxGuests: 6, description: "Просторная квартира у подножья гор. 15 минут до Медеу, 25 минут до Шымбулак. Камин, терраса с мангалом, вид на горы. Для семьи или компании.", priceWeekday: 30000, priceWeekend: 40000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Микроволновка", "Телевизор", "Парковка", "Балкон"]), photos: JSON.stringify([]) },

    // Шымкент
    { userId: owner1.id, name: "Квартира в Нурсате", type: "apartment" as const, address: "ул. Байтурсынова 22, кв 15", city: "Шымкент", rooms: 2, beds: 2, maxGuests: 4, description: "Новая квартира в районе Нурсат. Чисто, тепло, уютно. Рядом рынок Бекжан, ТРЦ Mega Шымкент.", priceWeekday: 8000, priceWeekend: 10000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Телевизор", "Парковка"]), photos: JSON.stringify([]) },

    // Караганда
    { userId: owner1.id, name: "Студия у Парка Победы", type: "studio" as const, address: "ул. Ермекова 58, кв 8", city: "Караганда", rooms: 1, beds: 1, maxGuests: 2, description: "Компактная студия с ремонтом 2025 года. Рядом парк Победы, ТРЦ City Mall. Тихий двор, кодовый замок.", priceWeekday: 7000, priceWeekend: 9000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Микроволновка", "Домофон"]), photos: JSON.stringify([]) },

    // Актау
    { userId: owner2.id, name: "Квартира с видом на море", type: "apartment" as const, address: "14 мкр, дом 5, кв 72", city: "Актау", rooms: 2, beds: 2, maxGuests: 4, description: "Квартира с прямым видом на Каспийское море. Свежий ремонт, балкон на закат, пляж в 5 минутах пешком.", priceWeekday: 15000, priceWeekend: 20000, amenities: JSON.stringify(["Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Телевизор", "Балкон"]), photos: JSON.stringify([]) },

    // Туркестан
    { userId: owner1.id, name: "Дом у мавзолея Ясави", type: "house" as const, address: "ул. Тауке хана 35", city: "Туркестан", rooms: 3, beds: 4, maxGuests: 8, description: "Частный гостевой дом в 10 минутах от мавзолея Ходжи Ахмеда Ясави. Двор с казаном, тандыр, мангал. Идеально для паломников и туристов.", priceWeekday: 15000, priceWeekend: 18000, amenities: JSON.stringify(["Wi-Fi", "Холодильник", "Стиральная машина", "Парковка"]), photos: JSON.stringify([]) },
  ];

  const insertedProperties = [];
  for (const p of demoProperties) {
    const [inserted] = await db.insert(properties).values(p).returning();
    insertedProperties.push(inserted);
  }

  // Demo guests
  const demoGuests = [
    { userId: owner1.id, name: "Нурлан Ахметов", phone: "+7 707 123 4567", city: "Астана", rating: 5, totalBookings: 3, totalSpent: 48000 },
    { userId: owner1.id, name: "Дана Сериков", phone: "+7 778 234 5678", city: "Алматы", rating: 4, totalBookings: 2, totalSpent: 30000 },
    { userId: owner2.id, name: "Алексей Петров", phone: "+7 701 345 6789", email: "alex@mail.ru", city: "Москва", rating: 5, totalBookings: 1, totalSpent: 45000 },
    { userId: owner2.id, name: "Айгерим Мухамеджанова", phone: "+7 747 456 7890", city: "Шымкент", rating: 5, totalBookings: 4, totalSpent: 96000 },
    { userId: owner1.id, name: "Бекзат Оспанов", phone: "+7 776 567 8901", city: "Караганда", rating: 3, totalBookings: 1, totalSpent: 8000 },
    { userId: owner2.id, name: "Мария Ким", phone: "+7 702 678 9012", email: "maria.kim@gmail.com", city: "Алматы", rating: 5, totalBookings: 6, totalSpent: 180000 },
  ];

  const insertedGuests = [];
  for (const g of demoGuests) {
    const [inserted] = await db.insert(guests).values(g).returning();
    insertedGuests.push(inserted);
  }

  // Demo bookings (past, current, future)
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  const demoBookings = [
    // Past bookings
    { propertyId: insertedProperties[0].id, guestId: insertedGuests[0].id, userId: owner1.id, checkIn: fmt(addDays(today, -20)), checkOut: fmt(addDays(today, -18)), nights: 2, totalPrice: 16000, status: "checked_out" as const, source: "direct" as const, paymentStatus: "paid" as const, guestName: "Нурлан Ахметов", guestPhone: "+7 707 123 4567" },
    { propertyId: insertedProperties[1].id, guestId: insertedGuests[1].id, userId: owner1.id, checkIn: fmt(addDays(today, -15)), checkOut: fmt(addDays(today, -12)), nights: 3, totalPrice: 36000, status: "checked_out" as const, source: "whatsapp" as const, paymentStatus: "paid" as const, guestName: "Дана Сериков", guestPhone: "+7 778 234 5678" },
    { propertyId: insertedProperties[3].id, guestId: insertedGuests[2].id, userId: owner2.id, checkIn: fmt(addDays(today, -10)), checkOut: fmt(addDays(today, -7)), nights: 3, totalPrice: 45000, status: "checked_out" as const, source: "booking" as const, paymentStatus: "paid" as const, guestName: "Алексей Петров", guestPhone: "+7 701 345 6789" },
    { propertyId: insertedProperties[4].id, guestId: insertedGuests[3].id, userId: owner2.id, checkIn: fmt(addDays(today, -8)), checkOut: fmt(addDays(today, -5)), nights: 3, totalPrice: 66000, status: "checked_out" as const, source: "airbnb" as const, paymentStatus: "paid" as const, guestName: "Айгерим Мухамеджанова", guestPhone: "+7 747 456 7890" },

    // Current bookings
    { propertyId: insertedProperties[0].id, guestId: insertedGuests[4].id, userId: owner1.id, checkIn: fmt(addDays(today, -1)), checkOut: fmt(addDays(today, 2)), nights: 3, totalPrice: 24000, status: "checked_in" as const, source: "widget" as const, paymentStatus: "paid" as const, guestName: "Бекзат Оспанов", guestPhone: "+7 776 567 8901" },
    { propertyId: insertedProperties[5].id, guestId: insertedGuests[5].id, userId: owner2.id, checkIn: fmt(today), checkOut: fmt(addDays(today, 4)), nights: 4, totalPrice: 180000, status: "confirmed" as const, source: "direct" as const, paymentStatus: "paid" as const, guestName: "Мария Ким", guestPhone: "+7 702 678 9012" },

    // Future bookings
    { propertyId: insertedProperties[2].id, guestId: insertedGuests[0].id, userId: owner1.id, checkIn: fmt(addDays(today, 5)), checkOut: fmt(addDays(today, 8)), nights: 3, totalPrice: 75000, status: "confirmed" as const, source: "whatsapp" as const, paymentStatus: "paid" as const, guestName: "Нурлан Ахметов", guestPhone: "+7 707 123 4567" },
    { propertyId: insertedProperties[6].id, guestId: insertedGuests[1].id, userId: owner2.id, checkIn: fmt(addDays(today, 7)), checkOut: fmt(addDays(today, 10)), nights: 3, totalPrice: 36000, status: "pending" as const, source: "widget" as const, paymentStatus: "pending" as const, guestName: "Дана Сериков", guestPhone: "+7 778 234 5678" },
    { propertyId: insertedProperties[7].id, guestId: insertedGuests[3].id, userId: owner2.id, checkIn: fmt(addDays(today, 10)), checkOut: fmt(addDays(today, 14)), nights: 4, totalPrice: 120000, status: "confirmed" as const, source: "direct" as const, paymentStatus: "paid" as const, guestName: "Айгерим Мухамеджанова", guestPhone: "+7 747 456 7890" },
  ];

  for (const b of demoBookings) {
    const [inserted] = await db.insert(bookings).values(b).returning();
    // Create matching transaction
    await db.insert(transactions).values({
      userId: b.userId,
      propertyId: b.propertyId,
      bookingId: inserted.id,
      type: "income",
      category: "Бронирование",
      amount: b.totalPrice,
      date: b.checkIn,
      description: `${b.guestName} — ${b.nights} ноч.`,
    });
  }

  // Some expense transactions
  const expenses = [
    { userId: owner1.id, propertyId: insertedProperties[0].id, type: "expense" as const, category: "Уборка", amount: 3000, date: fmt(addDays(today, -18)), description: "Уборка после гостя" },
    { userId: owner1.id, propertyId: insertedProperties[1].id, type: "expense" as const, category: "Коммуналка", amount: 15000, date: fmt(addDays(today, -5)), description: "Коммуналка за март" },
    { userId: owner2.id, propertyId: insertedProperties[3].id, type: "expense" as const, category: "Уборка", amount: 5000, date: fmt(addDays(today, -7)), description: "Клининг после гостя" },
    { userId: owner2.id, propertyId: insertedProperties[4].id, type: "expense" as const, category: "Ремонт", amount: 25000, date: fmt(addDays(today, -3)), description: "Замена смесителя" },
    { userId: owner1.id, propertyId: insertedProperties[2].id, type: "expense" as const, category: "Реклама", amount: 5000, date: fmt(addDays(today, -1)), description: "Поднятие на Krisha" },
  ];

  for (const e of expenses) {
    await db.insert(transactions).values(e);
  }

  return NextResponse.json({
    ok: true,
    users: 3,
    properties: insertedProperties.length,
    guests: insertedGuests.length,
    bookings: demoBookings.length,
    note: "Login: arman@rentpro.kz / demo123 или asel@rentpro.kz / demo123",
  });
}
