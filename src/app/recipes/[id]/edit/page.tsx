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

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/recipes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          const r = data.recipe;
          setTitle(r.title ?? "");
          setImageUrl(r.imageUrl);
          setIngredients(r.ingredients ?? "");
          setSteps(r.steps ?? "");
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("加载失败");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("请输入菜名");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          imageUrl,
          ingredients: ingredients.trim() || null,
          steps: steps.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "保存失败");
        setSubmitting(false);
        return;
      }
      router.replace(`/recipes/${id}`);
    } catch {
      toast.error("保存失败");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="编辑菜谱" showBell={false} />
        <div className="px-4 py-6 space-y-4">
          <div className="h-10 rounded bg-muted/50 animate-pulse" />
          <div className="h-32 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-28 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="编辑菜谱" showBell={false} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        <div className="space-y-2">
          <Label htmlFor="title">菜名 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>封面图片（可选）</Label>
          {imageUrl ? (
            <div className="relative rounded-lg overflow-hidden ring-1 ring-foreground/10">
              <img src={imageUrl} alt="" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                移除
              </button>
            </div>
          ) : (
            <ImageUpload type="recipe" onUpload={(url) => setImageUrl(url)} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ingredients">食材清单</Label>
          <Textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={"主料：\n调料："}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="steps">烹饪步骤</Label>
          <Textarea
            id="steps"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="1. &#10;2. &#10;3. "
            rows={5}
          />
        </div>

        <div className="mt-auto pt-4">
          <Button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full"
          >
            {submitting ? "保存中..." : "保存修改"}
          </Button>
        </div>
      </form>
    </div>
  );
}
