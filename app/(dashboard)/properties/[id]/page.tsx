"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Pencil, MapPin, Users, Bed, Home, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  const [rules, setRules] = useState<any[]>([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: "", type: "season", dateFrom: "", dateTo: "", priceOverride: 0, multiplier: 0 });

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setProperty(data); setLoading(false); })
      .catch(() => setLoading(false));
    fetch(`/api/price-rules?propertyId=${id}`).then(r => r.json()).then(setRules).catch(() => {});
  }, [id]);

  const addRule = async () => {
    const res = await fetch("/api/price-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ruleForm, propertyId: id, priceOverride: ruleForm.priceOverride || null, multiplier: ruleForm.multiplier || null }),
    });
    if (res.ok) {
      const rule = await res.json();
      setRules(prev => [...prev, rule]);
      setShowRuleForm(false);
      setRuleForm({ name: "", type: "season", dateFrom: "", dateTo: "", priceOverride: 0, multiplier: 0 });
      toast.success("Правило добавлено");
    }
  };

  const deleteRule = async (ruleId: string) => {
    await fetch(`/api/price-rules?id=${ruleId}`, { method: "DELETE" });
    setRules(prev => prev.filter(r => r.id !== ruleId));
    toast.success("Правило удалено");
  };

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

      {/* Price Rules */}
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Правила ценообразования</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowRuleForm(!showRuleForm)}>
            <Plus className="w-4 h-4 mr-1" />Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {showRuleForm && (
            <div className="border rounded-lg p-3 mb-3 space-y-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Название</Label><Input value={ruleForm.name} onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })} placeholder="Новый год" /></div>
                <div>
                  <Label className="text-xs">Тип</Label>
                  <Select value={ruleForm.type} onValueChange={v => { if (v) setRuleForm({ ...ruleForm, type: v }); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="season">Сезон</SelectItem>
                      <SelectItem value="holiday">Праздник</SelectItem>
                      <SelectItem value="weekend">Выходные</SelectItem>
                      <SelectItem value="special">Спецпредложение</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">С</Label><Input type="date" value={ruleForm.dateFrom} onChange={e => setRuleForm({ ...ruleForm, dateFrom: e.target.value })} /></div>
                <div><Label className="text-xs">По</Label><Input type="date" value={ruleForm.dateTo} onChange={e => setRuleForm({ ...ruleForm, dateTo: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Фикс. цена (₸)</Label><Input type="number" value={ruleForm.priceOverride} onChange={e => setRuleForm({ ...ruleForm, priceOverride: Number(e.target.value) })} /></div>
                <div><Label className="text-xs">Или множитель (x)</Label><Input type="number" step="0.1" value={ruleForm.multiplier} onChange={e => setRuleForm({ ...ruleForm, multiplier: Number(e.target.value) })} /></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addRule}>Сохранить</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowRuleForm(false)}>Отмена</Button>
              </div>
            </div>
          )}
          {rules.length === 0 && !showRuleForm && (
            <p className="text-sm text-gray-400">Нет дополнительных правил. Используются базовые цены + праздники КЗ.</p>
          )}
          {rules.map(r => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
              <div>
                <span className="font-medium">{r.name}</span>
                <span className="text-gray-400 ml-2">({r.type})</span>
                <span className="text-gray-500 ml-2">{r.dateFrom} → {r.dateTo}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">
                  {r.priceOverride ? `${Number(r.priceOverride).toLocaleString()} ₸` : `x${r.multiplier}`}
                </span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => deleteRule(r.id)}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
