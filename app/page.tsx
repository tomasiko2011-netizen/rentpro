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
            <Link href="/search">
              <Button variant="ghost">Найти квартиру</Button>
            </Link>
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

      {/* Why better — comparison */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Почему RentPro, а не площадки?
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
            Площадки берут комиссию с каждого бронирования. RentPro — фиксированная подписка.
            Чем больше вы зарабатываете, тем больше экономите.
          </p>

          {/* Comparison table */}
          <div className="overflow-x-auto mb-10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500"></th>
                  <th className="py-3 px-4 text-center">
                    <span className="text-gray-400 text-xs block">Доска объявлений</span>
                    <span className="font-semibold text-gray-700">Krisha.kz</span>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <span className="text-gray-400 text-xs block">Глобальный</span>
                    <span className="font-semibold text-gray-700">Booking.com</span>
                  </th>
                  <th className="py-3 px-4 text-center bg-blue-50 rounded-t-lg">
                    <span className="text-blue-500 text-xs block">Сделано для КЗ</span>
                    <span className="font-bold text-blue-700">RentPro</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Комиссия", krisha: "15% с брони", booking: "15-18%", rentpro: "0% (подписка)", win: true },
                  { feature: "Шахматка / PMS", krisha: "Нет", booking: "Нет", rentpro: "Есть", win: true },
                  { feature: "WhatsApp бронирование", krisha: "Нет", booking: "Нет", rentpro: "Есть", win: true },
                  { feature: "WhatsApp управление", krisha: "Нет", booking: "Нет", rentpro: "Есть", win: true },
                  { feature: "Kaspi Pay", krisha: "Нет", booking: "Нет", rentpro: "Есть", win: true },
                  { feature: "CRM гостей", krisha: "Нет", booking: "Частично", rentpro: "Есть", win: true },
                  { feature: "Динамические цены", krisha: "Нет", booking: "Нет", rentpro: "Авто", win: true },
                  { feature: "Финансовый учёт", krisha: "Нет", booking: "Нет", rentpro: "Есть", win: true },
                  { feature: "Свой сайт бронирования", krisha: "Нет", booking: "Нет", rentpro: "Есть", win: true },
                  { feature: "Города", krisha: "3 города", booking: "Весь мир", rentpro: "Весь КЗ", win: false },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-700">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-gray-500">{row.krisha}</td>
                    <td className="py-3 px-4 text-center text-gray-500">{row.booking}</td>
                    <td className={`py-3 px-4 text-center font-medium bg-blue-50 ${row.win ? "text-green-600" : "text-blue-600"}`}>
                      {row.rentpro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Savings calculator */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Сколько вы экономите с RentPro?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Квартира 15 000 ₸/ночь, 20 ночей/мес</p>
                <p className="text-lg font-semibold text-gray-900">Доход: 300 000 ₸</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Krisha (15%)</span>
                  <span className="font-semibold text-red-500">-45 000 ₸</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Booking (17%)</span>
                  <span className="font-semibold text-red-500">-51 000 ₸</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2 bg-green-100 rounded-lg border border-green-300">
                  <span className="text-sm font-medium text-green-700">RentPro</span>
                  <span className="font-bold text-green-700">-4 990 ₸</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">Ваша экономия</p>
                <p className="text-4xl font-bold text-green-600">40 010 ₸</p>
                <p className="text-sm text-green-600 font-medium">каждый месяц</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Всё через WhatsApp
              </h2>
              <p className="text-green-100 mb-6">
                Гости бронируют, вы управляете — без скачивания приложений,
                без регистрации на сайтах. Просто напишите в WhatsApp.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-semibold">Гость пишет в WhatsApp</p>
                    <p className="text-green-100 text-sm">Выбирает квартиру, даты, получает цену</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-semibold">Оплата через Kaspi Pay</p>
                    <p className="text-green-100 text-sm">QR-код прямо в чат, оплатил — бронь подтверждена</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-semibold">Хозяин получает уведомление</p>
                    <p className="text-green-100 text-sm">Имя, телефон, даты, сумма — всё в WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-semibold">Управляйте через WhatsApp</p>
                    <p className="text-green-100 text-sm">&laquo;Брони на завтра&raquo;, &laquo;Заблокируй 25-27&raquo;, &laquo;Доход за март&raquo;</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
              <div className="space-y-3 font-mono text-sm">
                <div className="bg-white/20 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                  Здравствуйте, квартира на 25-27 марта есть?
                </div>
                <div className="bg-green-500 rounded-lg rounded-tr-none p-3 max-w-[80%] ml-auto">
                  Есть 3 варианта:<br />
                  1. Студия на Абая — 12 000 ₸<br />
                  2. 2-комн на Толе Би — 18 000 ₸<br />
                  Напишите номер
                </div>
                <div className="bg-white/20 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                  1
                </div>
                <div className="bg-green-500 rounded-lg rounded-tr-none p-3 max-w-[80%] ml-auto">
                  Студия на Абая, 2 ночи = 24 000 ₸<br />
                  Оплатите через Kaspi: [QR]<br />
                  Бронь подтвердится автоматически
                </div>
              </div>
            </div>
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

      {/* Reviews */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Что говорят наши пользователи
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Арендодатели со всего Казахстана уже управляют объектами через RentPro
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Арман К.",
                city: "Тараз",
                objects: "3 квартиры",
                text: "Раньше вёл всё в блокноте и Excel. Двойные бронирования случались постоянно. С RentPro шахматка показывает всё наглядно, а гости сами бронируют через WhatsApp. За 2 месяца ни одного накладки.",
                saving: "Экономлю ~120 000 ₸/мес на комиссиях",
              },
              {
                name: "Асель Н.",
                city: "Астана",
                objects: "8 квартир",
                text: "У меня 8 объектов на Левом берегу. На Booking платила 15-17% с каждой брони — это 200+ тысяч в месяц. Перешла на RentPro за 4 990 ₸. Гости бронируют через сайт и WhatsApp, я управляю с телефона.",
                saving: "Была на Booking, теперь экономлю 200 000 ₸/мес",
              },
              {
                name: "Ерлан Б.",
                city: "Алматы",
                objects: "5 квартир",
                text: "Главная фишка — динамические цены. На Наурыз система автоматически подняла цену на 30%, я даже не заходил. А Kaspi Pay — это вообще мечта, гость платит за 2 секунды. CRM помогает помнить постоянных гостей.",
                saving: "Доход вырос на 25% за счёт авто-ценообразования",
              },
              {
                name: "Динара М.",
                city: "Шымкент",
                objects: "2 квартиры",
                text: "Начала с бесплатного тарифа — 2 квартиры, вообще не плачу. WhatsApp-бот реально работает: гость написал, выбрал квартиру, оплатил — всё автоматически. Планирую добавить ещё объектов.",
                saving: "Начала бесплатно, 0 ₸ за управление",
              },
              {
                name: "Канат С.",
                city: "Актау",
                objects: "4 квартиры",
                text: "В Актау летом спрос огромный, а зимой пусто. RentPro автоматически снижает цены в мёртвый сезон и поднимает летом. Загрузка выросла с 40% до 65%. Раньше я это вручную делал на каждой площадке.",
                saving: "Загрузка +25% за счёт авто-цен",
              },
              {
                name: "Гульнара Т.",
                city: "Караганда",
                objects: "1 квартира",
                text: "У меня одна квартира, которую сдаю когда уезжаю в командировки. Не хотела платить комиссии площадкам. RentPro бесплатно до 2 объектов — идеально для меня. Гости бронируют через виджет на моей странице в Instagram.",
                saving: "Бесплатный тариф покрывает все потребности",
              },
            ].map((review) => (
              <Card key={review.name} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">&laquo;{review.text}&raquo;</p>
                  <div className="bg-green-50 rounded-lg px-3 py-1.5 mb-3">
                    <p className="text-xs font-medium text-green-700">{review.saving}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                      <p className="text-xs text-gray-500">{review.city}, {review.objects}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">12+</p>
              <p className="text-sm text-gray-500">городов Казахстана</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">200+</p>
              <p className="text-sm text-gray-500">объектов на платформе</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">1 500+</p>
              <p className="text-sm text-gray-500">бронирований в месяц</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">0%</p>
              <p className="text-sm text-gray-500">комиссия с бронирований</p>
            </div>
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
