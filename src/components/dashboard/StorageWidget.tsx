import { HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageDrive {
  name: string;
  used: number;
  total: number;
  mount: string;
}

interface StorageWidgetProps {
  drives: StorageDrive[];
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} TB`;
  return `${bytes} GB`;
}

export function StorageWidget({ drives, className }: StorageWidgetProps) {
  return (
    <div
      className={cn(
        "glass-card glow-border p-5 opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: "500ms" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <HardDrive className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Storage</p>
      </div>

      <div className="space-y-4">
        {drives.map((drive) => {
          const percentage = (drive.used / drive.total) * 100;
          const isWarning = percentage > 80;
          const isCritical = percentage > 90;

          return (
            <div key={drive.mount} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{drive.name}</span>
                <span className="text-muted-foreground text-xs">
                  {formatBytes(drive.used)} / {formatBytes(drive.total)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    isCritical
                      ? "bg-destructive"
                      : isWarning
                      ? "bg-warning"
                      : "bg-primary"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground/70">{drive.mount}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
