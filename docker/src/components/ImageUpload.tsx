"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  className?: string;
}

export function ImageUpload({ onUpload, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUpload(data.url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={className}
        aria-label="上传图片"
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <ImagePlus className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
        )}
      </button>
    </>
  );
}
