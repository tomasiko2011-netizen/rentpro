"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, TrendingUp, Calendar, Home, DollarSign, Percent,
} from "lucide-react";

interface Stats {
  properties: any[];
  bookings: any[];
  transactions: { transactions: any[]; summary: any };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Stats>({
    properties: [],
    bookings: [],
    transactions: { transactions: [], summary: { income: 0, expense: 0, profit: 0 } },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/properties").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/finance").then((r) => r.json()),
    ]).then(([properties, bookings, transactions]) => {
      setData({ properties, bookings, transactions });
    });
  }, []);

  const { properties, bookings, transactions } = data;
  const activeBookings = bookings.filter((b: any) => b.status !== "cancelled");

  // ADR — Average Daily Rate
  const totalRevenue = activeBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);
  const totalNights = activeBookings.reduce((sum: number, b: any) => sum + (b.nights || 0), 0);
  const adr = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;

  // Occupancy rate (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
  const nowStr = now.toISOString().split("T")[0];

  const occupiedNights = activeBookings
    .filter((b: any) => b.checkOut > thirtyDaysAgoStr && b.checkIn < nowStr)
    .reduce((sum: number, b: any) => {
      const start = new Date(Math.max(new Date(b.checkIn).getTime(), thirtyDaysAgo.getTime()));
      const end = new Date(Math.min(new Date(b.checkOut).getTime(), now.getTime()));
      const nights = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      return sum + nights;
    }, 0);

  const totalAvailableNights = properties.length * 30;
  const occupancyRate = totalAvailableNights > 0
    ? Math.round((occupiedNights / totalAvailableNights) * 100)
    : 0;

  // RevPAR — Revenue Per Available Room (per night, last 30 days)
  const revenueLastMonth = activeBookings
    .filter((b: any) => b.checkIn >= thirtyDaysAgoStr && b.checkIn <= nowStr)
    .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);
  const revpar = totalAvailableNights > 0 ? Math.round(revenueLastMonth / totalAvailableNights) : 0;

  // Per-property stats
  const propertyStats = properties.map((p: any) => {
    const propBookings = activeBookings.filter((b: any) => b.propertyId === p.id);
    const revenue = propBookings.reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);
    const nights = propBookings.reduce((s: number, b: any) => s + (b.nights || 0), 0);
    const propAdr = nights > 0 ? Math.round(revenue / nights) : 0;

    // Occupancy for this property
    const propOccupiedNights = propBookings
      .filter((b: any) => b.checkOut > thirtyDaysAgoStr && b.checkIn < nowStr)
      .reduce((sum: number, b: any) => {
        const start = new Date(Math.max(new Date(b.checkIn).getTime(), thirtyDaysAgo.getTime()));
        const end = new Date(Math.min(new Date(b.checkOut).getTime(), now.getTime()));
        return sum + Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      }, 0);
    const propOccupancy = Math.round((propOccupiedNights / 30) * 100);

    return { ...p, revenue, nights, adr: propAdr, occupancy: propOccupancy, bookingCount: propBookings.length };
  }).sort((a: any, b: any) => b.revenue - a.revenue);

  // Booking sources
  const sourceCounts: Record<string, number> = {};
  activeBookings.forEach((b: any) => {
    sourceCounts[b.source] = (sourceCounts[b.source] || 0) + 1;
  });
  const sourceLabels: Record<string, string> = {
    direct: "Прямая", booking: "Booking", airbnb: "Airbnb",
    krisha: "Krisha", widget: "Сайт", whatsapp: "WhatsApp",
  };

  // Monthly revenue (last 6 months)
  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
    const monthLabel = d.toLocaleDateString("ru-RU", { month: "short" });
    const rev = activeBookings
      .filter((b: any) => b.checkIn?.startsWith(monthStr))
      .reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);
    monthlyRevenue.push({ month: monthLabel, revenue: rev });
  }
  const maxMonthRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Аналитика</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-500">ADR</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{adr.toLocaleString("ru-KZ")} ₸</p>
            <p className="text-xs text-gray-500">Средняя цена/ночь</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Загрузка</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{occupancyRate}%</p>
            <p className="text-xs text-gray-500">За 30 дней</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-500">RevPAR</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{revpar.toLocaleString("ru-KZ")} ₸</p>
            <p className="text-xs text-gray-500">Доход/доступная ночь</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-gray-500">Броней</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeBookings.length}</p>
            <p className="text-xs text-gray-500">Всего активных</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Revenue chart (simple bar) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Доход по месяцам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyRevenue.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-12">{m.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all flex items-center justify-end px-2"
                      style={{ width: `${Math.max(2, (m.revenue / maxMonthRevenue) * 100)}%` }}
                    >
                      {m.revenue > 0 && (
                        <span className="text-xs text-white font-medium">
                          {(m.revenue / 1000).toFixed(0)}к
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Источники бронирований</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(sourceCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(sourceCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {sourceLabels[source] || source}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-full rounded-full"
                            style={{
                              width: `${(count / activeBookings.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Нет данных</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-property table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="w-5 h-5" />
            По объектам
          </CardTitle>
        </CardHeader>
        <CardContent>
          {propertyStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Объект</th>
                    <th className="pb-2 font-medium text-right">Броней</th>
                    <th className="pb-2 font-medium text-right">Ночей</th>
                    <th className="pb-2 font-medium text-right">Доход</th>
                    <th className="pb-2 font-medium text-right">ADR</th>
                    <th className="pb-2 font-medium text-right">Загрузка</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyStats.map((p: any) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium text-gray-900">{p.name}</td>
                      <td className="py-2.5 text-right">{p.bookingCount}</td>
                      <td className="py-2.5 text-right">{p.nights}</td>
                      <td className="py-2.5 text-right font-medium text-green-600">
                        {p.revenue.toLocaleString("ru-KZ")} ₸
                      </td>
                      <td className="py-2.5 text-right">{p.adr.toLocaleString("ru-KZ")} ₸</td>
                      <td className="py-2.5 text-right">
                        <Badge variant={p.occupancy > 70 ? "default" : p.occupancy > 40 ? "secondary" : "outline"}>
                          {p.occupancy}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Добавьте объекты и создайте бронирования для аналитики</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
