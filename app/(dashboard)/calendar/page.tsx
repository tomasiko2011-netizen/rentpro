"use client";
import { useState, useEffect, useCallback } from "react";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import BookingDialog from "@/components/booking/BookingDialog";
import { toast } from "sonner";
import { usePusherRefresh } from "@/lib/use-pusher";

export default function CalendarPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [dialog, setDialog] = useState<{
    open: boolean;
    data?: Record<string, any>;
  }>({ open: false });

  const load = useCallback(async () => {
    const [propsRes, bookRes] = await Promise.all([
      fetch("/api/properties"),
      fetch("/api/bookings"),
    ]);
    if (propsRes.ok) setProperties(await propsRes.json());
    if (bookRes.ok) setBookings(await bookRes.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePusherRefresh(load);

  const handleCreateBooking = (propertyId: string, checkIn: string, checkOut: string) => {
    const property = properties.find((p: any) => p.id === propertyId);
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    setDialog({
      open: true,
      data: {
        propertyId,
        checkIn,
        checkOut,
        totalPrice: property ? nights * property.priceWeekday : 0,
      },
    });
  };

  const handleClickBooking = (booking: any) => {
    setDialog({ open: true, data: { ...booking, id: booking.id } });
  };

  const handleSave = async (data: Record<string, unknown>) => {
    const isEdit = !!dialog.data?.id;
    const url = isEdit ? `/api/bookings/${dialog.data!.id}` : "/api/bookings";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success(isEdit ? "Бронирование обновлено" : "Бронирование создано");
      setDialog({ open: false });
      load();
    } else {
      const err = await res.json();
      toast.error(err.error || "Ошибка");
    }
  };

  const handleDelete = async () => {
    if (!dialog.data?.id) return;
    const res = await fetch(`/api/bookings/${dialog.data!.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Бронирование удалено");
      setDialog({ open: false });
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Шахматка</h1>
          <p className="text-sm text-gray-500 mt-1">
            {properties.length} объектов, {bookings.filter((b: any) => b.status !== "cancelled").length} активных броней
          </p>
        </div>
      </div>

      <CalendarGrid
        properties={properties}
        bookings={bookings}
        onCreateBooking={handleCreateBooking}
        onClickBooking={handleClickBooking}
      />

      <BookingDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        properties={properties}
        initialData={dialog.data}
        onSave={handleSave}
        onDelete={dialog.data?.id ? handleDelete : undefined}
      />
    </div>
  );
}
