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

export default function CreateWishPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !points) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          points: Number(points),
          imageUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "创建失败");
        setSubmitting(false);
        return;
      }

      router.replace("/wishes");
    } catch {
      toast.error("创建失败");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <TopBar title="发布心愿" showBell={false} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6 flex-1">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">心愿标题</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：一起去看电影"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">心愿描述（可选）</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="详细描述你的心愿..."
            rows={4}
          />
        </div>

        {/* Image */}
        <div className="space-y-2">
          <Label>图片（可选）</Label>
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
            <ImageUpload type="wish" onUpload={(url) => setImageUrl(url)} />
          )}
        </div>

        {/* Points */}
        <div className="space-y-2">
          <Label htmlFor="points">积分</Label>
          <Input
            id="points"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="实现心愿需要多少积分"
            min="1"
            required
          />
        </div>

        {/* Submit */}
        <div className="mt-auto pt-4">
          <Button
            type="submit"
            disabled={submitting || !title.trim() || !points}
            className="w-full"
          >
            {submitting ? "发布中..." : "发布心愿"}
          </Button>
        </div>
      </form>
    </div>
  );
}
