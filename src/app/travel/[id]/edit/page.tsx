"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";
import { Search } from "lucide-react";

export default function EditTravelPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [name, setName] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tagline, setTagline] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [placesToVisit, setPlacesToVisit] = useState("");
  const [itineraryDraft, setItineraryDraft] = useState("");
  const [budgetEstimate, setBudgetEstimate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ name: string; lat: string; lng: string }[]>([]);

  async function handleSearchCity() {
    if (!city.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city.trim())}&format=json&limit=5&accept-language=zh`
      );
      const data = await res.json();
      setSearchResults(
        data.map((r: { display_name: string; lat: string; lon: string }) => ({
          name: r.display_name,
          lat: r.lat,
          lng: r.lon,
        }))
      );
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function selectSearchResult(r: { name: string; lat: string; lng: string }) {
    setLat(r.lat);
    setLng(r.lng);
    setSearchResults([]);
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/travel/${id}`)
      .then((res) => { if (!res.ok) throw new Error("Not found"); return res.json(); })
      .then((data) => {
        if (cancelled) return;
        setName(data.name ?? "");
        setCoverImage(data.coverImage);
        setTagline(data.tagline ?? "");
        setCity(data.city ?? "");
        setLat(data.lat != null ? String(data.lat) : "");
        setLng(data.lng != null ? String(data.lng) : "");
        setPlacesToVisit(data.placesToVisit ?? "");
        setItineraryDraft(data.itineraryDraft ?? "");
        setBudgetEstimate(data.budgetEstimate != null ? String(data.budgetEstimate) : "");
        setNotes(data.notes ?? "");
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { toast.error("加载失败"); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("请输入目的地名"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/travel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          coverImage,
          tagline: tagline.trim() || null,
          city: city || null,
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null,
          placesToVisit: placesToVisit.trim() || null,
          itineraryDraft: itineraryDraft.trim() || null,
          budgetEstimate: budgetEstimate ? Number(budgetEstimate) : null,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.error ?? "保存失败"); setSubmitting(false); return; }
      router.replace(`/travel/${id}`);
    } catch { toast.error("保存失败"); setSubmitting(false); }
  }

  if (loading) {
    return (
      <>
        <TopBar title="编辑目的地" showBell={false} />
        <div className="px-4 py-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted/50 animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="编辑目的地" showBell={false} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        <div className="space-y-2">
          <Label htmlFor="name">目的地名 *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>封面图（可选）</Label>
          {coverImage ? (
            <div className="relative rounded-lg overflow-hidden ring-1 ring-foreground/10">
              <img src={coverImage} alt="" className="w-full h-40 object-cover" />
              <button type="button" onClick={() => setCoverImage(null)} className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-xs text-muted-foreground">移除</button>
            </div>
          ) : (
            <ImageUpload type="travel" onUpload={(url) => setCoverImage(url)} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">标语</Label>
          <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">城市（选填，输入后搜索定位）</Label>
          <div className="flex gap-2">
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchCity(); } }}
              placeholder="如：大理"
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleSearchCity} disabled={searching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="rounded-lg border bg-card divide-y max-h-40 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSearchResult(r)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition-colors"
                >
                  <p className="truncate">{r.name}</p>
                  <p className="text-muted-foreground">{r.lat}, {r.lng}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {(lat || lng) && (
          <div className="space-y-2">
            <Label>经纬度（已定位）</Label>
            <div className="flex gap-2">
              <Input value={lat} onChange={(e) => setLat(e.target.value)} type="number" step="any" placeholder="纬度" className="flex-1" />
              <Input value={lng} onChange={(e) => setLng(e.target.value)} type="number" step="any" placeholder="经度" className="flex-1" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="places">想去的地点（每行一个）</Label>
          <Textarea id="places" value={placesToVisit} onChange={(e) => setPlacesToVisit(e.target.value)} rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="itinerary">行程草稿</Label>
          <Textarea id="itinerary" value={itineraryDraft} onChange={(e) => setItineraryDraft(e.target.value)} rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">预算估算（元）</Label>
          <Input id="budget" type="number" value={budgetEstimate} onChange={(e) => setBudgetEstimate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">备注</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>

        <div className="mt-auto pt-4">
          <Button type="submit" disabled={submitting || !name.trim()} className="w-full">
            {submitting ? "保存中..." : "保存修改"}
          </Button>
        </div>
      </form>
    </div>
  );
}
