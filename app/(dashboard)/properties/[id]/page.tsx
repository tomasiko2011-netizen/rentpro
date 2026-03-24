"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, MapPin, Users, Bed, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  rooms: number;
  beds: number;
  maxGuests: number;
  description: string;
  photos: string;
  amenities: string;
  priceWeekday: number;
  priceWeekend: number;
  minNights: number;
  checkInTime: string;
  checkOutTime: string;
  status: string;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setProperty(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12 text-gray-500">Загрузка...</div>;
  if (!property) return <div className="text-center py-12 text-gray-500">Объект не найден</div>;

  const photos: string[] = JSON.parse(property.photos || "[]");
  const amenities: string[] = JSON.parse(property.amenities || "[]");
  const typeLabels: Record<string, string> = { apartment: "Квартира", house: "Дом", room: "Комната", studio: "Студия" };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/properties">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          <Badge variant={property.status === "active" ? "default" : "secondary"}>
            {property.status === "active" ? "Активен" : property.status}
          </Badge>
        </div>
        <Link href={`/properties/${id}/edit`}>
          <Button variant="outline" size="sm"><Pencil className="w-4 h-4 mr-1" /> Редактировать</Button>
        </Link>
      </div>

      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {photos.map((url, i) => (
            <div key={i} className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Информация</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Home className="w-4 h-4 text-gray-400" /> {typeLabels[property.type] || property.type}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {property.address}, {property.city}</div>
            <div className="flex items-center gap-2"><Bed className="w-4 h-4 text-gray-400" /> {property.rooms} к, {property.beds} сп</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> до {property.maxGuests} гостей</div>
            {property.description && <p className="text-gray-600 pt-2">{property.description}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Цены и условия</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Будни: <span className="font-semibold text-blue-600">{Number(property.priceWeekday).toLocaleString()} ₸</span>/ночь</div>
            <div>Выходные: <span className="font-semibold text-blue-600">{Number(property.priceWeekend).toLocaleString()} ₸</span>/ночь</div>
            <div>Мин. ночей: {property.minNights}</div>
            <div>Заезд: {property.checkInTime} / Выезд: {property.checkOutTime}</div>
          </CardContent>
        </Card>
      </div>

      {amenities.length > 0 && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-lg">Удобства</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <span key={a} className="px-3 py-1 rounded-full text-sm bg-blue-50 border border-blue-200 text-blue-700">{a}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
