import Link from "next/link";
import { MapPin } from "lucide-react";

interface DestinationCardProps {
  id: number;
  name: string;
  coverImage?: string | null;
  tagline?: string | null;
  status: string;
  city?: string | null;
}

export function DestinationCard({ id, name, coverImage, tagline, status, city }: DestinationCardProps) {
  return (
    <Link
      href={`/travel/${id}`}
      className="block rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden hover:ring-foreground/30 transition-all"
    >
      {/* Cover image */}
      <div className="h-28 bg-muted relative overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-3xl text-muted-foreground">
            🗺️
          </div>
        )}
        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            status === "visited"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {status === "visited" ? "已去过" : "想去"}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium truncate">{name}</h3>
        {tagline && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{tagline}</p>
        )}
        {city && (
          <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {city}
          </p>
        )}
      </div>
    </Link>
  );
}
