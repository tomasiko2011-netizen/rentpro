"use client";
import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, Bed, Users, Clock, ArrowLeft, Check, Phone, Mail,
} from "lucide-react";
import { toast } from "sonner";

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ paymentId: string; paymentUrl: string | null } | null>(null);
  const [form, setForm] = useState({
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
  });

  useEffect(() => {
    fetch(`/api/public/properties/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProperty(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const [dynamicPrice, setDynamicPrice] = useState<{ total: number; nights: number; dailyPrices?: any[] } | null>(null);

  // Fetch dynamic pricing when dates change
  useEffect(() => {
    if (!form.checkIn || !form.checkOut || !id) {
      setDynamicPrice(null);
      return;
    }
    fetch(`/api/public/pricing?propertyId=${id}&checkIn=${form.checkIn}&checkOut=${form.checkOut}`)
      .then((r) => r.json())
      .then(setDynamicPrice)
      .catch(() => setDynamicPrice(null));
  }, [form.checkIn, form.checkOut, id]);

  const nights = dynamicPrice?.nights || (
    form.checkIn && form.checkOut
      ? Math.max(0, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
      : 0
  );

  const totalPrice = dynamicPrice?.total || nights * (property?.priceWeekday || 0);

  const isDateBooked = (date: string) => {
    if (!property?.bookedRanges) return false;
    return property.bookedRanges.some(
      (r: any) => date >= r.checkIn && date < r.checkOut
    );
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName || !form.guestPhone || !form.checkIn || !form.checkOut) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    if (nights < (property?.minNights || 1)) {
      toast.error(`Минимум ${property.minNights} ноч.`);
      return;
    }

    setBooking(true);
    const res = await fetch("/api/public/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId: id, ...form }),
    });
    setBooking(false);

    if (res.ok) {
      const data = await res.json();
      setPaymentInfo({ paymentId: data.paymentId, paymentUrl: data.paymentUrl });
      setSuccess(true);
      toast.success("Бронирование отправлено!");
    } else {
      const err = await res.json();
      toast.error(err.error || "Ошибка бронирования");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!property || property.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 mb-2">Объект не найден</p>
          <Link href="/search"><Button>Вернуться к поиску</Button></Link>
        </div>
      </div>
    );
  }

  const amenities = (() => {
    try { return JSON.parse(property.amenities || "[]"); } catch { return []; }
  })();

  const typeLabels: Record<string, string> = {
    apartment: "Квартира", house: "Дом", room: "Комната", studio: "Студия",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/search">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <span className="font-semibold text-gray-900 truncate">{property.name}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Property info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Photos */}
            {(() => {
              let photos: string[] = [];
              try { photos = JSON.parse(property.photos || "[]"); } catch {}
              if (photos.length > 0) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
                    <img src={photos[0]} alt={property.name} className="w-full h-64 md:h-80 object-cover" />
                    {photos.length > 1 && (
                      <div className="grid grid-cols-2 gap-2">
                        {photos.slice(1, 5).map((url: string, i: number) => (
                          <img key={i} src={url} alt={`${property.name} ${i + 2}`} className="w-full h-full object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div className="h-64 md:h-80 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center">
                  <span className="text-7xl">🏠</span>
                </div>
              );
            })()}

            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge>{typeLabels[property.type] || property.type}</Badge>
                <span className="text-sm text-gray-500">{property.rooms}к, {property.beds} сп</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                {property.address}, {property.city}
              </div>
            </div>

            {/* Details */}
            <Card>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-blue-600" />
                    <span>{property.rooms} комнат, {property.beds} сп. мест</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>до {property.maxGuests} гостей</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Заезд с {property.checkInTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Выезд до {property.checkOutTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Описание</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Удобства</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a: string) => (
                      <span key={a} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                        <Check className="w-3.5 h-3.5" />{a}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Booking form */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <div className="text-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {property.priceWeekday?.toLocaleString("ru-KZ")} ₸
                  </span>
                  <span className="text-gray-500"> /ночь</span>
                </div>
              </CardHeader>
              <CardContent>
                {success ? (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-3">✅</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Бронирование создано!</h3>
                    {paymentInfo?.paymentUrl ? (
                      <div className="space-y-3 mt-3">
                        <p className="text-sm text-gray-600">Оплатите через Kaspi Pay:</p>
                        <a
                          href={paymentInfo.paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="w-full bg-red-500 hover:bg-red-600 text-lg py-5">
                            Оплатить через Kaspi
                          </Button>
                        </a>
                        <p className="text-xs text-gray-400">Заказ: {paymentInfo.paymentId}</p>
                      </div>
                    ) : (
                      <div className="space-y-3 mt-3">
                        <p className="text-sm text-gray-600">
                          Для оплаты переведите на Kaspi Gold владельца с указанием номера заказа:
                        </p>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="font-mono font-bold text-lg">{paymentInfo?.paymentId}</p>
                          <p className="text-sm text-gray-500 mt-1">{totalPrice.toLocaleString("ru-KZ")} ₸</p>
                        </div>
                        <p className="text-xs text-gray-400">
                          После оплаты владелец подтвердит бронирование. Мы отправим уведомление в WhatsApp.
                        </p>
                      </div>
                    )}
                    <Link href="/search" className="block mt-4">
                      <Button variant="outline" className="w-full">Ещё квартиры</Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleBook} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Заезд</Label>
                        <Input
                          type="date"
                          value={form.checkIn}
                          onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Выезд</Label>
                        <Input
                          type="date"
                          value={form.checkOut}
                          onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {nights > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
                        {dynamicPrice?.dailyPrices?.some((d: any) => d.multiplier > 1) ? (
                          <>
                            {dynamicPrice.dailyPrices.map((d: any) => (
                              <div key={d.date} className="flex justify-between text-xs">
                                <span className={d.multiplier > 1 ? "text-orange-600 font-medium" : ""}>
                                  {new Date(d.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                                  {d.multiplier > 1 && " ↑"}
                                </span>
                                <span>{d.finalPrice.toLocaleString("ru-KZ")} ₸</span>
                              </div>
                            ))}
                            <div className="flex justify-between pt-1 border-t font-semibold">
                              <span>Итого ({nights} ноч.)</span>
                              <span>{totalPrice.toLocaleString("ru-KZ")} ₸</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span>{property.priceWeekday?.toLocaleString("ru-KZ")} ₸ x {nights} ноч.</span>
                            <span className="font-semibold">{totalPrice.toLocaleString("ru-KZ")} ₸</span>
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    <div>
                      <Label className="text-xs">Ваше имя *</Label>
                      <Input
                        value={form.guestName}
                        onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                        placeholder="Иван Иванов"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Телефон *
                      </Label>
                      <Input
                        value={form.guestPhone}
                        onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                        placeholder="+7 777 123 4567"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </Label>
                      <Input
                        type="email"
                        value={form.guestEmail}
                        onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={booking || nights === 0}
                    >
                      {booking
                        ? "Отправка..."
                        : nights > 0
                        ? `Забронировать за ${totalPrice.toLocaleString("ru-KZ")} ₸`
                        : "Выберите даты"}
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                      Бесплатная отмена до подтверждения
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
