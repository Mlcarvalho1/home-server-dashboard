import { ArrowDown, ArrowUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkWidgetProps {
  download: string;
  upload: string;
  totalDown: string;
  totalUp: string;
  className?: string;
}

export function NetworkWidget({
  download,
  upload,
  totalDown,
  totalUp,
  className,
}: NetworkWidgetProps) {
  return (
    <div
      className={cn(
        "glass-card glow-border p-5 opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Network</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowDown className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Download</span>
          </div>
          <p className="text-xl font-bold text-success">{download}</p>
          <p className="text-xs text-muted-foreground/70">Total: {totalDown}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Upload</span>
          </div>
          <p className="text-xl font-bold text-primary">{upload}</p>
          <p className="text-xs text-muted-foreground/70">Total: {totalUp}</p>
        </div>
      </div>

      <div className="mt-4 h-12 flex items-end gap-0.5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-primary/30 rounded-t transition-all duration-300"
            style={{
              height: `${Math.random() * 100}%`,
              opacity: 0.3 + (i / 20) * 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}
