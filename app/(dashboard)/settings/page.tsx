"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [password, setPassword] = useState({ newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(data => {
      if (!data.error) setProfile({ name: data.name || "", phone: data.phone || "" });
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    if (res.ok) toast.success("Профиль обновлён");
    else toast.error("Ошибка сохранения");
  };

  const savePassword = async () => {
    if (password.newPassword.length < 6) {
      toast.error("Минимум 6 символов");
      return;
    }
    if (password.newPassword !== password.confirm) {
      toast.error("Пароли не совпадают");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password.newPassword }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Пароль изменён");
      setPassword({ newPassword: "", confirm: "" });
    } else toast.error("Ошибка");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Настройки</h1>

      <Card className="mb-4">
        <CardHeader><CardTitle>Профиль</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Имя</Label>
            <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-400 mt-1">Email нельзя изменить</p>
          </div>
          <div>
            <Label>Телефон (WhatsApp)</Label>
            <Input
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+7 777 123 4567"
            />
            <p className="text-xs text-gray-400 mt-1">На этот номер придут уведомления о бронированиях</p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Роль:</span>
              <Badge variant="outline">{user?.role || "owner"}</Badge>
            </div>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader><CardTitle>Сменить пароль</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Новый пароль</Label>
            <Input type="password" value={password.newPassword} onChange={e => setPassword({ ...password, newPassword: e.target.value })} />
          </div>
          <div>
            <Label>Подтвердите пароль</Label>
            <Input type="password" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} />
          </div>
          <Button onClick={savePassword} disabled={saving || !password.newPassword}>
            Изменить пароль
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader><CardTitle>Тарифный план</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>WhatsApp (WAHA)</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Уведомления через WhatsApp отправляются автоматически при создании и изменении бронирований.
            Убедитесь что ваш телефон указан выше.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
