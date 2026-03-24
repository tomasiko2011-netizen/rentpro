"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Calendar, MessageCircle } from "lucide-react";

const CHANNELS = [
  { name: "Booking.com", icon: Globe, status: "soon", desc: "iCal синхронизация календарей" },
  { name: "Airbnb", icon: Calendar, status: "soon", desc: "iCal импорт/экспорт бронирований" },
  { name: "Krisha.kz", icon: Globe, status: "soon", desc: "Публикация объявлений" },
  { name: "WhatsApp", icon: MessageCircle, status: "active", desc: "Уведомления и бронирования через WAHA" },
];

export default function ChannelsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Каналы</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {CHANNELS.map((ch) => (
          <Card key={ch.name}>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <ch.icon className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">{ch.name}</CardTitle>
              <Badge variant={ch.status === "active" ? "default" : "secondary"} className="ml-auto">
                {ch.status === "active" ? "Активен" : "Скоро"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{ch.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
