"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { DestinationCard } from "@/components/DestinationCard";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { ExpenseList } from "@/components/ExpenseList";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getExpenseSummary } from "@/lib/db";

const TravelMap = dynamic(() => import("@/components/TravelMap").then(m => ({ default: m.TravelMap })), { ssr: false });

interface Destination {
  id: number;
  name: string;
  coverImage: string | null;
  tagline: string | null;
  status: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  placesToVisit: string | null;
  itineraryDraft: string | null;
  budgetEstimate: number | null;
  notes: string | null;
  visitedAt: string | null;
  creatorId: number;
}

interface Expense {
  id: number;
  destinationId: number;
  category: string;
  amount: number;
  payer: string;
  note: string | null;
  createdAt: string;
  destinationName?: string;
}

const tabs = [
  { key: "wishlist", label: "愿望清单" },
  { key: "map", label: "足迹地图" },
  { key: "expenses", label: "花费记录" },
] as const;

function TravelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "wishlist");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ReturnType<typeof getExpenseSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const searchParam = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
    try {
      const [destRes, expRes] = await Promise.all([
        fetch(`/api/travel${searchParam}`),
        fetch("/api/travel/expenses/all"),
      ]);
      if (destRes.ok) {
        const d = await destRes.json();
        setDestinations(d.destinations);
      }
      if (expRes.ok) {
        const e = await expRes.json();
        setExpenses(e.expenses);
        setSummary(e.summary);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const wishlist = destinations.filter((d) => d.status === "wishlist");

  return (
    <>
      <TopBar title="旅游" showBell={false} />

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索目的地..." className="pl-9" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <PullToRefresh onRefresh={load}>
        <div className="px-4 pb-4">
          {loading ? (
            <Skeleton className="h-[152px]" count={3} />
          ) : (
            <>
              {/* Tab 1: Wishlist */}
              {activeTab === "wishlist" && (
                <div className="grid grid-cols-2 gap-3">
                  {wishlist.map((d) => (
                    <DestinationCard
                      key={d.id}
                      id={d.id}
                      name={d.name}
                      coverImage={d.coverImage}
                      tagline={d.tagline}
                      status={d.status}
                      city={d.city}
                    />
                  ))}
                  {/* Add new card */}
                  <button
                    onClick={() => router.push("/travel/create")}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 h-[152px] hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">添加目的地</span>
                  </button>
                  {wishlist.length === 0 && destinations.length === 0 && (
                    <div className="col-span-2">
                      <EmptyState icon="🧭" title={debouncedSearch ? "没有找到匹配的目的地" : "还没有目的地"} description={debouncedSearch ? "换个关键词试试" : "添加你想去的地方吧"} />
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Map */}
              {activeTab === "map" && (
                <div className="space-y-4">
                  <TravelMap destinations={destinations} />
                  {/* Visited destinations list */}
                  {destinations.filter((d) => d.status === "visited").length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">已去过的目的地</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {destinations
                          .filter((d) => d.status === "visited")
                          .map((d) => (
                            <DestinationCard
                              key={d.id}
                              id={d.id}
                              name={d.name}
                              coverImage={d.coverImage}
                              tagline={d.tagline}
                              status={d.status}
                              city={d.city}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Expenses */}
              {activeTab === "expenses" && (
                <div className="space-y-4">
                  <ExpenseSummary data={summary} />
                  <ExpenseList
                    expenses={expenses}
                    destinations={destinations.map((d) => ({ id: d.id, name: d.name }))}
                    onRefresh={load}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </PullToRefresh>
    </>
  );
}

export default function TravelPage() {
  return (
    <Suspense>
      <TravelContent />
    </Suspense>
  );
}
