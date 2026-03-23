"use client";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Настройки</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Имя</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Роль</span>
            <Badge variant="outline">{user?.role || "owner"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Тарифный план</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg capitalize">{user?.plan || "free"}</p>
              <p className="text-sm text-gray-500">
                {user?.plan === "free" && "До 2 объектов"}
                {user?.plan === "standard" && "До 10 объектов"}
                {user?.plan === "pro" && "Безлимит объектов"}
              </p>
            </div>
            <Badge>{user?.plan === "free" ? "Бесплатный" : "Активен"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp (WAHA)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Уведомления через WhatsApp отправляются автоматически при создании и изменении бронирований.
            Настройка WAHA-сервера производится администратором.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
