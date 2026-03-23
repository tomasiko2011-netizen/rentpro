"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Bed, Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/properties").then((r) => r.json()).then(setProperties);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить объект?")) return;
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast.success("Объект удалён");
    }
  };

  const typeLabels: Record<string, string> = {
    apartment: "Квартира",
    house: "Дом",
    room: "Комната",
    studio: "Студия",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Объекты</h1>
          <p className="text-sm text-gray-500 mt-1">{properties.length} объектов</p>
        </div>
        <Link href="/properties/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Добавить объект
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((p: any) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <span className="text-4xl">🏠</span>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {p.address}, {p.city}
                  </div>
                </div>
                <Badge variant={p.status === "active" ? "default" : "secondary"}>
                  {p.status === "active" ? "Активен" : p.status === "maintenance" ? "Ремонт" : "Неактивен"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" />
                  {p.rooms} к, {p.beds} сп
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  до {p.maxGuests}
                </span>
                <span>{typeLabels[p.type] || p.type}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-600">
                  {p.priceWeekday?.toLocaleString("ru-KZ")} ₸
                  <span className="text-xs font-normal text-gray-500">/ночь</span>
                </div>
                <div className="flex gap-1">
                  <Link href={`/properties/${p.id}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏢</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Нет объектов</h2>
          <p className="text-gray-500 mb-4">Добавьте свой первый объект недвижимости</p>
          <Link href="/properties/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить объект
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
