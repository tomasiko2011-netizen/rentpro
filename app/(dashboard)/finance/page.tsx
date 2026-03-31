"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Wallet, Download } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = {
  income: ["Бронирование", "Допуслуги", "Депозит", "Другое"],
  expense: ["Уборка", "Ремонт", "Коммуналка", "Реклама", "Комиссия площадки", "Налог", "Другое"],
};

export default function FinancePage() {
  const [data, setData] = useState<{ transactions: any[]; summary: any }>({
    transactions: [],
    summary: { income: 0, expense: 0, profit: 0 },
  });
  const [dialog, setDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [form, setForm] = useState({
    type: "income" as "income" | "expense",
    category: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const load = () => fetch("/api/finance").then((r) => r.json()).then(setData);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Транзакция добавлена");
      setDialog(false);
      load();
    }
  };

  const { transactions } = data;

  // Filter by date range
  const filtered = transactions.filter(t => t.date >= dateFilter.from && t.date <= dateFilter.to);
  const filteredSummary = {
    income: filtered.filter(t => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0),
    expense: filtered.filter(t => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0),
    get profit() { return this.income - this.expense; },
  };

  const exportCSV = () => {
    const headers = "Дата;Тип;Категория;Сумма;Описание";
    const rows = filtered
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(t => `${t.date};${t.type === "income" ? "Доход" : "Расход"};${t.category};${t.amount};${t.description || ""}`);
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance_${dateFilter.from}_${dateFilter.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Финансы</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button onClick={() => setDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex gap-3 mb-4 items-end">
        <div>
          <Label className="text-xs text-gray-500">С</Label>
          <Input type="date" value={dateFilter.from} onChange={e => setDateFilter({ ...dateFilter, from: e.target.value })} className="w-40" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">По</Label>
          <Input type="date" value={dateFilter.to} onChange={e => setDateFilter({ ...dateFilter, to: e.target.value })} className="w-40" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Доходы</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredSummary.income.toLocaleString("ru-KZ")} ₸
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Расходы</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredSummary.expense.toLocaleString("ru-KZ")} ₸
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Прибыль</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredSummary.profit.toLocaleString("ru-KZ")} ₸
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Транзакции ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((t: any) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{t.category}</div>
                    <div className="text-xs text-gray-500">{t.date} {t.description && `— ${t.description}`}</div>
                  </div>
                  <span className={`font-semibold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "income" ? "+" : "-"}{t.amount?.toLocaleString("ru-KZ")} ₸
                  </span>
                </div>
              ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">Нет транзакций за выбранный период</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая транзакция</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label>Тип</Label>
              <Select value={form.type} onValueChange={(v) => { if (v) setForm({ ...form, type: v as "income" | "expense", category: "" }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Доход</SelectItem>
                  <SelectItem value="expense">Расход</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Категория</Label>
              <Select value={form.category} onValueChange={(v) => { if (v) setForm({ ...form, category: v }); }}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES[form.type].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Сумма (₸)</Label>
                <Input type="number" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Дата</Label>
                <Input type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Описание</Label>
              <Input value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Добавить</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
