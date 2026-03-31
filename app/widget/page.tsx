"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Users } from "lucide-react";
import { toast } from "sonner";

// Embeddable widget: /widget?userId=xxx
// Can be embedded via iframe on any website
export default function WidgetPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-400">Загрузка...</div>}>
      <WidgetPage />
    </Suspense>
  );
}

function WidgetPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [properties, setProperties] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guestName: "", guestPhone: "" });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = userId ? `?userId=${userId}` : "";
    fetch(`/api/public/properties${params}`).then((r) => r.json()).then(setProperties);
  }, [userId]);

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !form.guestName || !form.guestPhone || nights === 0) return;

    const res = await fetch("/api/public/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: selected.id,
        ...form,
      }),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      const err = await res.json();
      toast.error(err.error || "Ошибка");
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h2 className="text-lg font-semibold mb-1">Бронирование отправлено!</h2>
        <p className="text-sm text-gray-500">Мы свяжемся с вами в WhatsApp для подтверждения.</p>
        <Button className="mt-4" onClick={() => { setSuccess(false); setSelected(null); }}>
          Ещё бронирование
        </Button>
      </div>
    );
  }

  if (selected) {
    const total = nights * (selected.priceWeekday || 0);
    return (
      <div className="p-4 max-w-md mx-auto">
        <button onClick={() => setSelected(null)} className="text-sm text-blue-600 mb-3">&larr; Назад</button>
        <h2 className="font-semibold text-lg mb-1">{selected.name}</h2>
        <p className="text-sm text-gray-500 mb-4">{selected.priceWeekday?.toLocaleString("ru-KZ")} ₸/ночь</p>
        <form onSubmit={handleBook} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Заезд</Label><Input type="date" value={form.checkIn} onChange={(e) => setForm({...form, checkIn: e.target.value})} required /></div>
            <div><Label className="text-xs">Выезд</Label><Input type="date" value={form.checkOut} onChange={(e) => setForm({...form, checkOut: e.target.value})} required /></div>
          </div>
          {nights > 0 && <div className="bg-blue-50 p-2 rounded text-sm text-center font-medium">{nights} ноч. = {total.toLocaleString("ru-KZ")} ₸</div>}
          <div><Label className="text-xs">Имя</Label><Input value={form.guestName} onChange={(e) => setForm({...form, guestName: e.target.value})} required /></div>
          <div><Label className="text-xs">Телефон</Label><Input value={form.guestPhone} onChange={(e) => setForm({...form, guestPhone: e.target.value})} placeholder="+7 777 123 4567" required /></div>
          <Button type="submit" className="w-full" disabled={nights === 0}>Забронировать</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">RP</div>
        <span className="font-semibold text-sm">Бронирование</span>
      </div>
      <div className="space-y-3">
        {properties.map((p: any) => (
          <Card key={p.id} className="cursor-pointer hover:border-blue-200" onClick={() => setSelected(p)}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{p.rooms}к</span>
                  <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{p.maxGuests}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{p.priceWeekday?.toLocaleString("ru-KZ")} ₸</p>
                <p className="text-xs text-gray-400">/ночь</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {properties.length === 0 && <p className="text-center text-gray-400 py-8">Нет доступных объектов</p>}
    </div>
  );
}
