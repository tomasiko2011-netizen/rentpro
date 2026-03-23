"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Property {
  id: string;
  name: string;
  priceWeekday: number;
}

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  properties: Property[];
  initialData?: {
    propertyId?: string;
    checkIn?: string;
    checkOut?: string;
    id?: string;
    guestName?: string;
    guestPhone?: string;
    totalPrice?: number;
    status?: string;
    notes?: string;
    source?: string;
  };
  onSave: (data: Record<string, unknown>) => void;
  onDelete?: () => void;
}

export default function BookingDialog({
  open,
  onClose,
  properties,
  initialData,
  onSave,
  onDelete,
}: BookingDialogProps) {
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState({
    propertyId: initialData?.propertyId || "",
    checkIn: initialData?.checkIn || "",
    checkOut: initialData?.checkOut || "",
    guestName: initialData?.guestName || "",
    guestPhone: initialData?.guestPhone || "",
    totalPrice: initialData?.totalPrice || 0,
    status: initialData?.status || "pending",
    source: initialData?.source || "direct",
    notes: initialData?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  // Auto-calculate price
  const calcPrice = () => {
    if (!form.checkIn || !form.checkOut || !form.propertyId) return;
    const property = properties.find((p) => p.id === form.propertyId);
    if (!property) return;
    const nights = Math.ceil(
      (new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (nights > 0) {
      setForm((prev) => ({ ...prev, totalPrice: nights * property.priceWeekday }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Редактировать бронирование" : "Новое бронирование"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Объект</Label>
            <Select
              value={form.propertyId}
              onValueChange={(v) => { if (v) setForm({ ...form, propertyId: v }); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите объект" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Заезд</Label>
              <Input
                type="date"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                onBlur={calcPrice}
              />
            </div>
            <div>
              <Label>Выезд</Label>
              <Input
                type="date"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                onBlur={calcPrice}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Имя гостя</Label>
              <Input
                value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                placeholder="Иван Иванов"
              />
            </div>
            <div>
              <Label>Телефон</Label>
              <Input
                value={form.guestPhone}
                onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                placeholder="+7 777 123 4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Стоимость (₸)</Label>
              <Input
                type="number"
                value={form.totalPrice}
                onChange={(e) =>
                  setForm({ ...form, totalPrice: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Источник</Label>
              <Select
                value={form.source}
                onValueChange={(v) => { if (v) setForm({ ...form, source: v }); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Прямая</SelectItem>
                  <SelectItem value="booking">Booking.com</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="krisha">Krisha.kz</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="widget">Виджет</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEdit && (
            <div>
              <Label>Статус</Label>
              <Select
                value={form.status}
                onValueChange={(v) => { if (v) setForm({ ...form, status: v }); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Ожидание</SelectItem>
                  <SelectItem value="confirmed">Подтверждено</SelectItem>
                  <SelectItem value="checked_in">Заселён</SelectItem>
                  <SelectItem value="checked_out">Выселен</SelectItem>
                  <SelectItem value="cancelled">Отменено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Заметки</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Комментарий к бронированию..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
            </Button>
            {isEdit && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Удалить
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
