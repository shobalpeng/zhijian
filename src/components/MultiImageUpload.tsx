"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

interface MultiImageUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  type: string;
  max?: number;
}

export function MultiImageUpload({ urls, onChange, type, max = 9 }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/upload?type=${type}`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange([...urls, data.url]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  const canAdd = urls.length < max;

  return (
    <div className="grid grid-cols-3 gap-2">
      {urls.map((url, i) => (
        <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-muted ring-1 ring-foreground/10 group">
          <img src={url} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 hover:bg-muted/30 transition-colors"
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
