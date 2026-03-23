import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  MessageCircle,
  CreditCard,
  BarChart3,
  Radio,
  Users,
  Check,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Шахматка",
    desc: "Визуальный календарь занятости по всем объектам. Drag-and-drop для создания броней.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp уведомления",
    desc: "Автоматические сообщения гостям: подтверждение, напоминание о заезде и выезде.",
  },
  {
    icon: CreditCard,
    title: "Kaspi Pay",
    desc: "Принимайте оплату онлайн через Kaspi. Автоматическое подтверждение через webhook.",
  },
  {
    icon: Radio,
    title: "Channel Manager",
    desc: "Синхронизация с Booking.com, Airbnb, Krisha.kz. Без двойных бронирований.",
  },
  {
    icon: Users,
    title: "CRM гостей",
    desc: "База гостей с историей, рейтингами и чёрным списком. Вся информация в одном месте.",
  },
  {
    icon: BarChart3,
    title: "Аналитика",
    desc: "ADR, загрузка, доход по объектам. Понимайте, какие квартиры приносят больше.",
  },
];

const plans = [
  {
    name: "Бесплатный",
    price: "0",
    desc: "Для начинающих",
    features: ["До 2 объектов", "Шахматка", "CRM гостей", "WhatsApp уведомления"],
    cta: "Начать бесплатно",
    popular: false,
  },
  {
    name: "Стандарт",
    price: "4 990",
    desc: "Для профессионалов",
    features: [
      "До 10 объектов",
      "Всё из бесплатного",
      "Channel Manager",
      "Финансовый учёт",
      "Виджет бронирования",
      "Kaspi Pay",
    ],
    cta: "Подключить",
    popular: true,
  },
  {
    name: "Про",
    price: "9 990",
    desc: "Для управляющих компаний",
    features: [
      "Безлимит объектов",
      "Всё из стандарта",
      "Аналитика и отчёты",
      "Сотрудники и роли",
      "API доступ",
      "Приоритетная поддержка",
    ],
    cta: "Подключить",
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              RP
            </div>
            <span className="text-xl font-bold">RentPro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/register">
              <Button>Регистрация</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Управляйте посуточной арендой{" "}
            <span className="text-blue-600">как профи</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Шахматка, бронирования, WhatsApp уведомления, Kaspi Pay и Channel Manager
            в одном месте. Сделано для казахстанских арендодателей.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Попробовать бесплатно
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Бесплатно до 2 объектов. Без карты.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Все инструменты посуточника
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Тарифы</h2>
          <p className="text-center text-gray-500 mb-12">Цены в тенге за месяц</p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "border-blue-600 border-2 shadow-lg" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    Популярный
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-500">{plan.desc}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500"> ₸/мес</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Начните зарабатывать больше уже сегодня</h2>
          <p className="text-blue-100 mb-8">
            Присоединяйтесь к арендодателям Казахстана, которые управляют объектами через RentPro
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Создать аккаунт бесплатно
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              RP
            </div>
            <span className="font-semibold">RentPro.kz</span>
          </div>
          <p className="text-sm text-gray-500">2026 RentPro. Все права защищены. Казахстан.</p>
        </div>
      </footer>
    </div>
  );
}
