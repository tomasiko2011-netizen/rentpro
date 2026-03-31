"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AuthProvider from "@/lib/session-provider";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Неверный email или пароль");
    } else {
      router.push("/calendar");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
            RP
          </div>
          <CardTitle className="text-2xl">Вход в RentPro</CardTitle>
          <p className="text-sm text-gray-500">Управление посуточной арендой</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <Label>Пароль</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
          {/* Demo access */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-medium mb-2">Демо-доступ:</p>
            <div className="space-y-1">
              {[
                { email: "arman@rentpro.kz", label: "Арман (Standard, 6 объектов)" },
                { email: "asel@rentpro.kz", label: "Асель (Pro, 7 объектов)" },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-blue-100 transition-colors text-blue-800"
                  onClick={() => { setEmail(demo.email); setPassword("demo123"); }}
                >
                  {demo.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-blue-500 mt-1">Пароль: demo123</p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Регистрация
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
