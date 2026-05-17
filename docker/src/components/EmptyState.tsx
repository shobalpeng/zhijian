import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      {icon && <span className="text-4xl mb-3" aria-hidden="true">{icon}</span>}
      <p className="text-sm">{title}</p>
      {description && <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
