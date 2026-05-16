import Link from "next/link";
import { MapPin, Pencil } from "lucide-react";

interface WanderCardProps {
  id: number;
  location: string;
  date: string;
  imageUrl?: string | null;
  mood?: string | null;
  isLast?: boolean;
}

export function WanderCard({ id, location, date, imageUrl, mood, isLast }: WanderCardProps) {
  return (
    <div className="flex gap-3">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
      </div>

      {/* Card */}
      <Link
        href={`/wanders/${id}/edit`}
        className={`flex-1 min-w-0 rounded-xl bg-card ring-1 ring-foreground/10 hover:bg-muted/30 transition-colors overflow-hidden ${!isLast ? "mb-4" : ""}`}
      >
        {imageUrl && (
          <div className="h-40 bg-muted">
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{location}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
          {mood && (
            <p className="text-sm text-muted-foreground mt-1 italic">"{mood}"</p>
          )}
        </div>
      </Link>
    </div>
  );
}
