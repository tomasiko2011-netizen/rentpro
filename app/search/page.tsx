"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Bed, Users, Wifi, Car } from "lucide-react";

export default function SearchPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  const search = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.checkIn) params.set("checkIn", filters.checkIn);
    if (filters.checkOut) params.set("checkOut", filters.checkOut);
    if (filters.guests) params.set("guests", filters.guests);

    const res = await fetch(`/api/public/properties?${params}`);
    if (res.ok) setProperties(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    search();
  }, []);

  const typeLabels: Record<string, string> = {
    apartment: "Квартира",
    house: "Дом",
    room: "Комната",
    studio: "Студия",
  };

  const parseAmenities = (raw: string | null) => {
    try { return JSON.parse(raw || "[]"); } catch { return []; }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              RP
            </div>
            <span className="text-xl font-bold">RentPro</span>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Для владельцев</Button>
          </Link>
        </div>
      </header>

      {/* Search bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs text-gray-500">Город</Label>
              <Input
                placeholder="Тараз, Астана, Алматы..."
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Заезд</Label>
              <Input
                type="date"
                value={filters.checkIn}
                onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Выезд</Label>
              <Input
                type="date"
                value={filters.checkOut}
                onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
              />
            </div>
            <div className="w-24">
              <Label className="text-xs text-gray-500">Гостей</Label>
              <Input
                type="number"
                min={1}
                placeholder="2"
                value={filters.guests}
                onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={search} disabled={loading} className="w-full md:w-auto">
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Поиск..." : "Найти"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">
          {properties.length > 0
            ? `Найдено ${properties.length} объектов`
            : "Нет объектов по вашему запросу"}
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p: any) => {
            const amenities = parseAmenities(p.amenities);
            return (
              <Link key={p.id} href={`/property/${p.id}?checkIn=${filters.checkIn}&checkOut=${filters.checkOut}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center relative overflow-hidden">
                    {(() => {
                      try {
                        const photos = JSON.parse(p.photos || "[]");
                        if (photos.length > 0) return <img src={photos[0]} alt={p.name} className="w-full h-full object-cover" />;
                      } catch {}
                      return <span className="text-5xl">🏠</span>;
                    })()}
                    <Badge className="absolute top-3 left-3">{typeLabels[p.type] || p.type}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{p.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {p.address}, {p.city}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        {p.rooms}к, {p.beds}сп
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        до {p.maxGuests}
                      </span>
                    </div>

                    {amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {amenities.slice(0, 4).map((a: string) => (
                          <span key={a} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                            {a}
                          </span>
                        ))}
                        {amenities.length > 4 && (
                          <span className="text-xs text-gray-400">+{amenities.length - 4}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <span className="text-xl font-bold text-blue-600">
                          {p.priceWeekday?.toLocaleString("ru-KZ")} ₸
                        </span>
                        <span className="text-sm text-gray-500"> /ночь</span>
                      </div>
                      <Button size="sm">Подробнее</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {properties.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ничего не найдено</h2>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
}
