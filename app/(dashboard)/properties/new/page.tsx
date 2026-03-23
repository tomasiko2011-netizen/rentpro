"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const AMENITIES = [
  "Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Микроволновка",
  "Телевизор", "Парковка", "Балкон", "Лифт", "Домофон",
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "apartment",
    address: "",
    city: "Тараз",
    rooms: 1,
    beds: 1,
    maxGuests: 2,
    description: "",
    priceWeekday: 10000,
    priceWeekend: 15000,
    minNights: 1,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    amenities: [] as string[],
  });

  const toggleAmenity = (a: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      toast.error("Заполните название и адрес");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Объект создан!");
      router.push("/properties");
    } else {
      toast.error("Ошибка создания объекта");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Новый объект</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Основное</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Название *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Квартира на Абая 15"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Тип</Label>
                <Select value={form.type} onValueChange={(v) => { if (v) setForm({ ...form, type: v }); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Квартира</SelectItem>
                    <SelectItem value="house">Дом</SelectItem>
                    <SelectItem value="room">Комната</SelectItem>
                    <SelectItem value="studio">Студия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Город</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Адрес *</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="ул. Абая 15, кв. 42"
              />
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Уютная квартира в центре города..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Параметры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Комнат</Label>
                <Input type="number" min={1} value={form.rooms}
                  onChange={(e) => setForm({ ...form, rooms: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Спальных мест</Label>
                <Input type="number" min={1} value={form.beds}
                  onChange={(e) => setForm({ ...form, beds: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Макс. гостей</Label>
                <Input type="number" min={1} value={form.maxGuests}
                  onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Цены и условия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <Label>Цена будни (₸)</Label>
                <Input type="number" value={form.priceWeekday}
                  onChange={(e) => setForm({ ...form, priceWeekday: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Цена выходные (₸)</Label>
                <Input type="number" value={form.priceWeekend}
                  onChange={(e) => setForm({ ...form, priceWeekend: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Мин. ночей</Label>
                <Input type="number" min={1} value={form.minNights}
                  onChange={(e) => setForm({ ...form, minNights: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Заезд</Label>
                <Input type="time" value={form.checkInTime}
                  onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} />
              </div>
              <div>
                <Label>Выезд</Label>
                <Input type="time" value={form.checkOutTime}
                  onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Удобства</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.amenities.includes(a)
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Создание..." : "Создать объект"}
        </Button>
      </form>
    </div>
  );
}
