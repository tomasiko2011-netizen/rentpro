"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Building2,
  BookOpen,
  Users,
  Wallet,
  BarChart3,
  Radio,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/calendar", label: "Шахматка", icon: CalendarDays },
  { href: "/properties", label: "Объекты", icon: Building2 },
  { href: "/bookings", label: "Бронирования", icon: BookOpen },
  { href: "/guests", label: "Гости", icon: Users },
  { href: "/finance", label: "Финансы", icon: Wallet },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/channels", label: "Каналы", icon: Radio },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white">
      <div className="p-6 border-b">
        <Link href="/calendar" className="flex items-center gap-2">
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
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
