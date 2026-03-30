"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Calendar, MessageCircle, Copy, RefreshCw, Plus, Trash2, Link, Check } from "lucide-react";

interface Feed {
  listingId: string;
  propertyId: string;
  propertyName: string;
  platform: string;
  feedUrl: string | null;
  syncStatus: string;
  lastSync: string | null;
}

interface Property {
  id: string;
  name: string;
  icalToken: string | null;
}

const PLATFORMS = [
  { key: "booking", name: "Booking.com", icon: Globe, color: "text-blue-600" },
  { key: "airbnb", name: "Airbnb", icon: Calendar, color: "text-rose-500" },
  { key: "krisha", name: "Krisha.kz", icon: Globe, color: "text-green-600" },
];

export default function ChannelsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState<{ platform: string; propertyId: string } | null>(null);
  const [feedUrl, setFeedUrl] = useState("");
  const [syncing, setSyncing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [feedsRes, propsRes] = await Promise.all([
      fetch("/api/channels/ical"),
      fetch("/api/properties"),
    ]);
    if (feedsRes.ok) setFeeds(await feedsRes.json());
    if (propsRes.ok) setProperties(await propsRes.json());
    setLoading(false);
  }

  async function generateToken(propertyId: string) {
    const res = await fetch(`/api/properties/${propertyId}/ical-token`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setProperties(prev => prev.map(p =>
        p.id === propertyId ? { ...p, icalToken: data.token } : p
      ));
    }
  }

  async function addFeed() {
    if (!addDialog || !feedUrl) return;
    const res = await fetch("/api/channels/ical", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: addDialog.propertyId,
        platform: addDialog.platform,
        feedUrl,
      }),
    });
    if (res.ok) {
      setAddDialog(null);
      setFeedUrl("");
      loadData();
    }
  }

  async function deleteFeed(listingId: string) {
    const res = await fetch("/api/channels/ical", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    if (res.ok) loadData();
  }

  async function syncFeed(listingId: string) {
    setSyncing(listingId);
    await fetch(`/api/channels/ical/${listingId}/sync`, { method: "POST" });
    await loadData();
    setSyncing(null);
  }

  function copyUrl(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function getExportUrl(propertyId: string, token: string) {
    const base = window.location.origin;
    return `${base}/api/ical/${propertyId}?token=${token}`;
  }

  function formatTime(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    const now = Date.now();
    const diffMin = Math.floor((now - d.getTime()) / 60000);
    if (diffMin < 1) return "только что";
    if (diffMin < 60) return `${diffMin} мин назад`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)} ч назад`;
    return d.toLocaleDateString("ru-KZ");
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Загрузка...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Каналы</h1>

      {/* WhatsApp — always active */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <CardTitle className="text-base">WhatsApp</CardTitle>
          <Badge className="ml-auto">Активен</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Уведомления и бронирования через WAHA</p>
        </CardContent>
      </Card>

      {/* iCal Platforms */}
      {PLATFORMS.map(platform => {
        const platformFeeds = feeds.filter(f => f.platform === platform.key);

        return (
          <Card key={platform.key} className="mb-4">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <platform.icon className={`w-5 h-5 ${platform.color}`} />
              <CardTitle className="text-base">{platform.name}</CardTitle>
              <Badge
                variant={platformFeeds.length > 0 ? "default" : "secondary"}
                className="ml-auto"
              >
                {platformFeeds.length > 0 ? `${platformFeeds.length} подключено` : "iCal"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Per-property rows */}
              {properties.map(prop => {
                const feed = platformFeeds.find(f => f.propertyId === prop.id);
                const exportUrl = prop.icalToken ? getExportUrl(prop.id, prop.icalToken) : null;

                return (
                  <div key={prop.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{prop.name}</span>
                      {feed && (
                        <Badge variant={feed.syncStatus === "synced" ? "default" : feed.syncStatus === "error" ? "destructive" : "secondary"}>
                          {feed.syncStatus === "synced" ? "Синхр." : feed.syncStatus === "error" ? "Ошибка" : "Ожидание"}
                        </Badge>
                      )}
                    </div>

                    {/* Import feed */}
                    {feed ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Link className="w-3 h-3 shrink-0" />
                        <span className="truncate">{feed.feedUrl}</span>
                        <span className="shrink-0">{formatTime(feed.lastSync)}</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 shrink-0"
                          onClick={() => syncFeed(feed.listingId)}
                          disabled={syncing === feed.listingId}
                        >
                          <RefreshCw className={`w-3 h-3 ${syncing === feed.listingId ? "animate-spin" : ""}`} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 shrink-0 text-red-500"
                          onClick={() => deleteFeed(feed.listingId)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => { setAddDialog({ platform: platform.key, propertyId: prop.id }); setFeedUrl(""); }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Добавить iCal-ссылку
                      </Button>
                    )}

                    {/* Export URL */}
                    <div className="flex items-center gap-2">
                      {exportUrl ? (
                        <>
                          <span className="text-xs text-gray-400 truncate">Экспорт: {exportUrl.substring(0, 50)}...</span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 shrink-0"
                            onClick={() => copyUrl(exportUrl, `export-${prop.id}`)}
                          >
                            {copied === `export-${prop.id}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-6 text-blue-600"
                          onClick={() => generateToken(prop.id)}
                        >
                          Создать экспорт-ссылку
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Add Feed Dialog */}
      {addDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setAddDialog(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">Добавить iCal-ссылку</h3>
            <p className="text-sm text-gray-500 mb-3">
              Вставьте iCal URL из {PLATFORMS.find(p => p.key === addDialog.platform)?.name}
            </p>
            <Input
              placeholder="https://www.airbnb.com/calendar/ical/..."
              value={feedUrl}
              onChange={e => setFeedUrl(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddDialog(null)}>Отмена</Button>
              <Button onClick={addFeed} disabled={!feedUrl.startsWith("https://")}>Подключить</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
