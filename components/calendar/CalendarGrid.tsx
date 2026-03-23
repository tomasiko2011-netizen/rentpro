"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  name: string;
  type: string;
}

interface Booking {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestName: string | null;
  guestPhone: string | null;
  status: string;
  totalPrice: number;
  source: string;
}

interface CalendarGridProps {
  properties: Property[];
  bookings: Booking[];
  onCreateBooking: (propertyId: string, checkIn: string, checkOut: string) => void;
  onClickBooking: (booking: Booking) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-200 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-200 text-blue-800 border-blue-300",
  checked_in: "bg-green-200 text-green-800 border-green-300",
  checked_out: "bg-gray-200 text-gray-600 border-gray-300",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

const SOURCE_LABELS: Record<string, string> = {
  direct: "Прямая",
  booking: "Booking",
  airbnb: "Airbnb",
  krisha: "Krisha",
  widget: "Виджет",
  whatsapp: "WhatsApp",
};

function getDaysArray(start: Date, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function dateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function isWeekend(d: Date) {
  return d.getDay() === 0 || d.getDay() === 6;
}

const DAYS_VISIBLE = 30;

export default function CalendarGrid({
  properties,
  bookings,
  onCreateBooking,
  onClickBooking,
}: CalendarGridProps) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selecting, setSelecting] = useState<{
    propertyId: string;
    start: string;
    end: string;
  } | null>(null);

  const days = useMemo(() => getDaysArray(startDate, DAYS_VISIBLE), [startDate]);

  const navigate = (dir: number) => {
    setStartDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + dir * 7);
      return d;
    });
  };

  const getBookingsForCell = (propertyId: string, day: string) => {
    return bookings.filter(
      (b) =>
        b.propertyId === propertyId &&
        b.status !== "cancelled" &&
        b.checkIn <= day &&
        b.checkOut > day
    );
  };

  const getBookingSpan = (booking: Booking, dayIndex: number) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const dayDate = days[dayIndex];

    if (dateStr(dayDate) !== booking.checkIn) return null;

    let span = 0;
    for (let i = dayIndex; i < days.length; i++) {
      if (dateStr(days[i]) < booking.checkOut) span++;
      else break;
    }
    return span;
  };

  const handleMouseDown = (propertyId: string, day: string) => {
    if (getBookingsForCell(propertyId, day).length > 0) return;
    setSelecting({ propertyId, start: day, end: day });
  };

  const handleMouseEnter = (propertyId: string, day: string) => {
    if (!selecting || selecting.propertyId !== propertyId) return;
    setSelecting((prev) => prev ? { ...prev, end: day } : null);
  };

  const handleMouseUp = () => {
    if (selecting) {
      const [start, end] = [selecting.start, selecting.end].sort();
      const endDate = new Date(end);
      endDate.setDate(endDate.getDate() + 1);
      onCreateBooking(selecting.propertyId, start, dateStr(endDate));
      setSelecting(null);
    }
  };

  const isSelected = (propertyId: string, day: string) => {
    if (!selecting || selecting.propertyId !== propertyId) return false;
    const [start, end] = [selecting.start, selecting.end].sort();
    return day >= start && day <= end;
  };

  const today = dateStr(new Date());
  const monthName = startDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            setStartDate(d);
          }}
        >
          Сегодня
        </Button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto" onMouseUp={handleMouseUp}>
        <div className="min-w-[900px]">
          {/* Date headers */}
          <div className="flex border-b bg-gray-50 sticky top-0 z-10">
            <div className="w-48 min-w-48 p-3 font-medium text-sm text-gray-600 border-r">
              Объект
            </div>
            {days.map((day) => {
              const ds = dateStr(day);
              const isToday = ds === today;
              return (
                <div
                  key={ds}
                  className={cn(
                    "flex-1 min-w-[40px] p-1 text-center text-xs border-r",
                    isWeekend(day) && "bg-orange-50",
                    isToday && "bg-blue-50 font-bold"
                  )}
                >
                  <div className="text-gray-500">
                    {day.toLocaleDateString("ru-RU", { weekday: "short" })}
                  </div>
                  <div className={cn(isToday ? "text-blue-600" : "text-gray-800")}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Property rows */}
          {properties.map((property) => {
            const rendered = new Set<string>();
            return (
              <div key={property.id} className="flex border-b hover:bg-gray-50/50">
                <div className="w-48 min-w-48 p-3 border-r">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {property.name}
                  </div>
                  <div className="text-xs text-gray-500">{property.type}</div>
                </div>
                {days.map((day, dayIndex) => {
                  const ds = dateStr(day);
                  const cellBookings = getBookingsForCell(property.id, ds);
                  const selected = isSelected(property.id, ds);

                  // Check if a booking starts on this day
                  let bookingBar = null;
                  for (const b of cellBookings) {
                    if (!rendered.has(b.id)) {
                      const span = getBookingSpan(b, dayIndex);
                      if (span) {
                        rendered.add(b.id);
                        bookingBar = (
                          <div
                            className={cn(
                              "absolute inset-y-1 left-0 rounded-md border cursor-pointer text-xs px-1 flex items-center truncate z-10",
                              STATUS_COLORS[b.status] || "bg-gray-100"
                            )}
                            style={{ width: `${span * 100}%` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onClickBooking(b);
                            }}
                          >
                            {b.guestName || "Бронь"}
                          </div>
                        );
                      }
                    }
                  }

                  return (
                    <div
                      key={ds}
                      className={cn(
                        "flex-1 min-w-[40px] h-12 border-r relative",
                        isWeekend(day) && "bg-orange-50/50",
                        selected && "bg-blue-100",
                        cellBookings.length === 0 && "cursor-crosshair"
                      )}
                      onMouseDown={() => handleMouseDown(property.id, ds)}
                      onMouseEnter={() => handleMouseEnter(property.id, ds)}
                    >
                      {bookingBar}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {properties.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Нет объектов</p>
              <p className="text-sm mt-1">Добавьте первый объект недвижимости</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t bg-gray-50 text-xs">
        {Object.entries(STATUS_COLORS).filter(([k]) => k !== "cancelled").map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded", cls.split(" ")[0])} />
            <span className="text-gray-600 capitalize">
              {{ pending: "Ожидание", confirmed: "Подтверждено", checked_in: "Заселён", checked_out: "Выселен" }[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

