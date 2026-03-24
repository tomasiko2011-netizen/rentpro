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
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const AMENITIES = [
  "Wi-Fi", "Кондиционер", "Стиральная машина", "Холодильник", "Микроволновка",
  "Телевизор", "Парковка", "Балкон", "Лифт", "Домофон",
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
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
      body: JSON.stringify({ ...form, photos }),
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Фото</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-3">
              {photos.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">{uploading ? "..." : "Фото"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files) return;
                    setUploading(true);
                    for (const file of Array.from(files)) {
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      if (res.ok) {
                        const { url } = await res.json();
                        setPhotos((prev) => [...prev, url]);
                      } else {
                        toast.error("Ошибка загрузки фото");
                      }
                    }
                    setUploading(false);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">До 5 МБ на фото. Первое фото — обложка.</p>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Создание..." : "Создать объект"}
        </Button>
      </form>
    </div>
  );
}
