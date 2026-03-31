"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BookingDialog from "@/components/booking/BookingDialog";
import { Plus, Search, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { usePusherRefresh } from "@/lib/use-pusher";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Ожидание", variant: "outline" },
  confirmed: { label: "Подтверждено", variant: "default" },
  checked_in: { label: "Заселён", variant: "default" },
  checked_out: { label: "Выселен", variant: "secondary" },
  cancelled: { label: "Отменено", variant: "destructive" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [filter, setFilter] = useState({ status: "all", search: "" });
  const [dialog, setDialog] = useState<{ open: boolean; data?: any }>({ open: false });

  const load = async () => {
    const [bRes, pRes] = await Promise.all([
      fetch("/api/bookings"),
      fetch("/api/properties"),
    ]);
    if (bRes.ok) setBookings(await bRes.json());
    if (pRes.ok) setProperties(await pRes.json());
  };

  useEffect(() => { load(); }, []);
  usePusherRefresh(load);

  const filtered = bookings
    .filter((b) => filter.status === "all" || b.status === filter.status)
    .filter((b) =>
      !filter.search ||
      b.guestName?.toLowerCase().includes(filter.search.toLowerCase()) ||
      b.guestPhone?.includes(filter.search)
    )
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  const handleSave = async (data: Record<string, unknown>) => {
    const isEdit = !!dialog.data?.id;
    const url = isEdit ? `/api/bookings/${dialog.data!.id}` : "/api/bookings";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success(isEdit ? "Обновлено" : "Создано");
      setDialog({ open: false });
      load();
    } else {
      const err = await res.json();
      toast.error(err.error || "Ошибка");
    }
  };

  const getPropertyName = (id: string) =>
    properties.find((p: any) => p.id === id)?.name || "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бронирования</h1>
          <p className="text-sm text-gray-500 mt-1">{bookings.length} всего</p>
        </div>
        <Button onClick={() => setDialog({ open: true })}>
          <Plus className="w-4 h-4 mr-2" />
          Новое бронирование
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск по имени или телефону..."
            className="pl-9"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
        </div>
        <Select value={filter.status} onValueChange={(v) => setFilter({ ...filter, status: v || "all" })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">Ожидание</SelectItem>
            <SelectItem value="confirmed">Подтверждено</SelectItem>
            <SelectItem value="checked_in">Заселён</SelectItem>
            <SelectItem value="checked_out">Выселен</SelectItem>
            <SelectItem value="cancelled">Отменено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((b: any) => {
          const st = STATUS_LABELS[b.status] || STATUS_LABELS.pending;
          return (
            <Card
              key={b.id}
              className="cursor-pointer hover:border-blue-200 transition-colors"
              onClick={() => setDialog({ open: true, data: b })}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {b.guestName || "Без имени"}
                    </div>
                    {b.guestPhone && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone className="w-3 h-3" />
                        {b.guestPhone}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {b.checkIn} → {b.checkOut}
                    </div>
                    <div>{getPropertyName(b.propertyId)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {b.totalPrice?.toLocaleString("ru-KZ")} ₸
                    </div>
                    <div className="text-xs text-gray-500">{b.nights} ноч.</div>
                  </div>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Нет бронирований</p>
        </div>
      )}

      <BookingDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        properties={properties}
        initialData={dialog.data}
        onSave={handleSave}
        onDelete={
          dialog.data?.id
            ? async () => {
                await fetch(`/api/bookings/${dialog.data!.id}`, { method: "DELETE" });
                toast.success("Удалено");
                setDialog({ open: false });
                load();
              }
            : undefined
        }
      />
    </div>
  );
}
