"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Check, Clock, SkipForward, Play, Plus } from "lucide-react";
import { toast } from "sonner";

interface Cleaning {
  id: string;
  propertyId: string;
  bookingId: string | null;
  date: string;
  time: string | null;
  status: string;
  assignee: string | null;
  notes: string | null;
}

interface Property {
  id: string;
  name: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Check }> = {
  pending: { label: "Ожидает", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_progress: { label: "В процессе", color: "bg-blue-100 text-blue-800", icon: Play },
  done: { label: "Готово", color: "bg-green-100 text-green-800", icon: Check },
  skipped: { label: "Пропущено", color: "bg-gray-100 text-gray-500", icon: SkipForward },
};

export default function CleaningsPage() {
  const [cleanings, setCleanings] = useState<Cleaning[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [dialog, setDialog] = useState(false);
  const [newCleaning, setNewCleaning] = useState({
    propertyId: "",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    assignee: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [cRes, pRes] = await Promise.all([
      fetch("/api/cleanings"),
      fetch("/api/properties"),
    ]);
    if (cRes.ok) setCleanings(await cRes.json());
    if (pRes.ok) setProperties(await pRes.json());
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/cleanings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setCleanings(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }

  async function updateAssignee(id: string, assignee: string) {
    await fetch("/api/cleanings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, assignee }),
    });
    setCleanings(prev => prev.map(c => c.id === id ? { ...c, assignee } : c));
  }

  async function handleCreateCleaning(e: React.FormEvent) {
    e.preventDefault();
    if (!newCleaning.propertyId) { toast.error("Выберите объект"); return; }
    const res = await fetch("/api/cleanings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCleaning),
    });
    if (res.ok) {
      toast.success("Уборка создана");
      setDialog(false);
      loadData();
    }
  }

  function getPropertyName(id: string) {
    return properties.find(p => p.id === id)?.name || "—";
  }

  const today = new Date().toISOString().split("T")[0];
  const filtered = cleanings.filter(c => filter === "all" || c.status === filter);
  const todayCount = cleanings.filter(c => c.date === today && c.status !== "done" && c.status !== "skipped").length;
  const pendingCount = cleanings.filter(c => c.status === "pending").length;
  const doneCount = cleanings.filter(c => c.status === "done").length;

  if (loading) return <div className="p-8 text-center text-gray-500">Загрузка...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Уборки</h1>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="text-sm">{todayCount} сегодня</Badge>
          <Badge variant="outline" className="text-sm">{pendingCount} ожидают</Badge>
          <Button size="sm" onClick={() => setDialog(true)}><Plus className="w-4 h-4 mr-1" />Добавить</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["all", "pending", "in_progress", "done", "skipped"].map(s => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "Все" : STATUS_MAP[s]?.label || s}
          </Button>
        ))}
      </div>

      {/* Cleanings list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет уборок</p>
            <p className="text-sm mt-1">Уборки создаются автоматически при подтверждении бронирования</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.pending;
            const isToday = c.date === today;
            const isPast = c.date < today;

            return (
              <Card key={c.id} className={isToday ? "border-blue-300 bg-blue-50/30" : isPast && c.status === "pending" ? "border-red-200 bg-red-50/20" : ""}>
                <CardContent className="py-3 flex items-center gap-4">
                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>
                    <st.icon className="w-3 h-3" />
                    {st.label}
                  </span>

                  {/* Property + date */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{getPropertyName(c.propertyId)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(c.date + "T00:00:00").toLocaleDateString("ru-KZ", { weekday: "short", day: "numeric", month: "short" })}
                      {c.time && ` в ${c.time}`}
                      {isToday && <span className="ml-2 text-blue-600 font-medium">Сегодня</span>}
                      {isPast && c.status === "pending" && <span className="ml-2 text-red-500 font-medium">Просрочено</span>}
                    </div>
                    {c.notes && <div className="text-xs text-gray-400 truncate">{c.notes}</div>}
                    <div className="text-xs text-gray-400">
                      Исполнитель:{" "}
                      <input
                        className="border-b border-dashed border-gray-300 bg-transparent outline-none w-28 text-gray-600"
                        placeholder="назначить..."
                        defaultValue={c.assignee || ""}
                        onBlur={(e) => { if (e.target.value !== (c.assignee || "")) updateAssignee(c.id, e.target.value); }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1 shrink-0">
                    {c.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => updateStatus(c.id, "in_progress")}>
                          <Play className="w-3 h-3 mr-1" /> Начать
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-400"
                          onClick={() => updateStatus(c.id, "skipped")}>
                          Пропустить
                        </Button>
                      </>
                    )}
                    {c.status === "in_progress" && (
                      <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatus(c.id, "done")}>
                        <Check className="w-3 h-3 mr-1" /> Готово
                      </Button>
                    )}
                    {(c.status === "done" || c.status === "skipped") && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs"
                        onClick={() => updateStatus(c.id, "pending")}>
                        Вернуть
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новая уборка</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateCleaning} className="space-y-3">
            <div>
              <Label>Объект</Label>
              <Select value={newCleaning.propertyId} onValueChange={v => { if (v) setNewCleaning({ ...newCleaning, propertyId: v }); }}>
                <SelectTrigger><SelectValue placeholder="Выберите объект" /></SelectTrigger>
                <SelectContent>
                  {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Дата</Label><Input type="date" value={newCleaning.date} onChange={e => setNewCleaning({ ...newCleaning, date: e.target.value })} /></div>
              <div><Label>Время</Label><Input type="time" value={newCleaning.time} onChange={e => setNewCleaning({ ...newCleaning, time: e.target.value })} /></div>
            </div>
            <div><Label>Исполнитель</Label><Input value={newCleaning.assignee} onChange={e => setNewCleaning({ ...newCleaning, assignee: e.target.value })} placeholder="Имя / телефон" /></div>
            <div><Label>Заметки</Label><Input value={newCleaning.notes} onChange={e => setNewCleaning({ ...newCleaning, notes: e.target.value })} /></div>
            <Button type="submit" className="w-full">Создать</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
