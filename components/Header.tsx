"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { nav } from "@/components/Sidebar";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const name = session?.user?.name || "User";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const unread = notifications.filter(n => !n.read).length;

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setNotifications(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" />}
          >
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 border-b">
              <Link href="/calendar" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  RP
                </div>
                <span className="text-xl font-bold text-gray-900">RentPro</span>
              </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {nav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Выйти
              </button>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold text-gray-900 md:hidden">RentPro</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-10 w-80 bg-white border rounded-lg shadow-lg z-40 max-h-96 overflow-auto">
                <div className="flex items-center justify-between p-3 border-b">
                  <span className="text-sm font-semibold">Уведомления</span>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                      Прочитать все
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-400">Нет уведомлений</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={cn(
                        "px-3 py-2.5 border-b last:border-0 text-sm",
                        !n.read && "bg-blue-50"
                      )}
                    >
                      <p className="font-medium text-gray-900">{n.title}</p>
                      {n.body && <p className="text-gray-500 text-xs mt-0.5">{n.body}</p>}
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(n.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium text-gray-700">{name}</span>
        </div>
      </div>
    </header>
  );
}
