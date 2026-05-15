"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";

export default function CreateRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("请输入菜名");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
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
        toast.error(err.error ?? "添加失败");
        setSubmitting(false);
        return;
      }
      router.replace("/recipes");
    } catch {
      toast.error("添加失败");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="添加菜谱" showBell={false} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">菜名 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：可乐鸡翅"
            required
          />
        </div>

        {/* Image */}
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
            <ImageUpload onUpload={(url) => setImageUrl(url)} />
          )}
        </div>

        {/* Ingredients */}
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

        {/* Steps */}
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
            {submitting ? "添加中..." : "添加菜谱"}
          </Button>
        </div>
      </form>
    </div>
  );
}
