"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Phone, Mail, Ban, Star } from "lucide-react";
import { toast } from "sonner";

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editGuest, setEditGuest] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", document: "", notes: "" });

  const load = () => fetch("/api/guests").then((r) => r.json()).then(setGuests);
  useEffect(() => { load(); }, []);

  const filtered = guests.filter(
    (g) =>
      !search ||
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.phone?.includes(search)
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Гость добавлен");
      setDialog(false);
      setForm({ name: "", phone: "", email: "", city: "", document: "", notes: "" });
      load();
    }
  };

  const toggleBlacklist = async (g: any) => {
    await fetch("/api/guests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: g.id, blacklisted: !g.blacklisted }),
    });
    setGuests(prev => prev.map(x => x.id === g.id ? { ...x, blacklisted: !x.blacklisted } : x));
    toast.success(g.blacklisted ? "Убран из ЧС" : "Добавлен в ЧС");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGuest) return;
    const res = await fetch("/api/guests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editGuest.id, ...form }),
    });
    if (res.ok) {
      toast.success("Гость обновлён");
      setEditGuest(null);
      load();
    }
  };

  const openEdit = (g: any) => {
    setForm({ name: g.name, phone: g.phone || "", email: g.email || "", city: g.city || "", document: g.document || "", notes: g.notes || "" });
    setEditGuest(g);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Гости</h1>
          <p className="text-sm text-gray-500 mt-1">{guests.length} гостей в базе</p>
        </div>
        <Button onClick={() => setDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить гостя
        </Button>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Поиск по имени или телефону..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((g: any) => (
          <Card key={g.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{g.name}</span>
                  {g.blacklisted && (
                    <Badge variant="destructive" className="text-xs">
                      <Ban className="w-3 h-3 mr-1" />
                      ЧС
                    </Badge>
                  )}
                  {g.rating && (
                    <span className="flex items-center gap-0.5 text-yellow-500 text-sm">
                      <Star className="w-3 h-3 fill-current" />
                      {g.rating}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  {g.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />{g.phone}
                    </span>
                  )}
                  {g.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />{g.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm">
                  <div className="font-medium">{g.totalBookings} броней</div>
                  <div className="text-gray-500">{(g.totalSpent || 0).toLocaleString("ru-KZ")} ₸</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openEdit(g)}>Ред.</Button>
                  <Button size="sm" variant={g.blacklisted ? "outline" : "ghost"} className="h-7 text-xs" onClick={() => toggleBlacklist(g)}>
                    <Ban className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">Нет гостей</p>
          <p className="text-sm mt-1">Гости создаются автоматически при бронировании</p>
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый гость</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label>Имя *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Телефон</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Город</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label>Документ</Label>
                <Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Заметки</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <Button type="submit" className="w-full">Добавить</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editGuest} onOpenChange={(v) => { if (!v) setEditGuest(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редактировать гостя</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3">
            <div><Label>Имя</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Телефон</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Город</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Документ</Label><Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} /></div>
            </div>
            <div><Label>Заметки</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <Button type="submit" className="w-full">Сохранить</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
